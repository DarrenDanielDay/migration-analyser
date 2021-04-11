import { isString } from "lodash";
import { DeclarationReflection, Reflection } from "typedoc";
import { assertIsNumber } from "../../utils";
import { fs, path, extensionCacheDir, extensionBase } from "../../utils/paths";
import { isNullish, isPrimitive } from "../../utils/type-guards";

export interface TypedocSource {
  fileName: string;
  /**
   * 1..*
   */
  line: number;
  /**
   * 0..*
   */
  character: number;
}

export interface FunctionAPI {
  dtsSource?: TypedocSource;
  accessPath: string[];
  name: string;
  sinceVersion?: string;
  deprecatedVersion?: string;
  deprecationDetailed?: string;
}

export class TypeDocJSONLoader {
  json: any;
  apis: FunctionAPI[] = [];
  objectMapping = new Map<number, Reflection>();
  constructor(public readonly packageName: string) {
    this.load().loadObjectIds().loadFunctionAPIs();
  }
  load() {
    this.json = JSON.parse(
      fs
        .readFileSync(
          path.resolve(
            extensionCacheDir,
            this.packageName,
            `${this.packageName}.json`
          )
        )
        .toString("utf-8")
    );
    return this;
  }

  private *dfs(
    currentPath: string[],
    currentNode: any
  ): Generator<{ node: any; path: string[] }, void, boolean | undefined> {
    const dive = yield { node: currentNode, path: currentPath.slice() };
    if (dive === false) return;
    if (isPrimitive(currentNode)) {
      return;
    }
    for (const [key, value] of Object.entries(currentNode)) {
      yield* this.dfs([...currentPath, key], value);
    }
  }

  loadObjectIds() {
    for (const { node } of this.dfs([], this.json)) {
      if (isNullish(node)) {
        continue;
      }
      const { id } = node;
      if (!isNullish(id)) {
        assertIsNumber(id);
        this.objectMapping.set(id, node);
      }
    }
    return this;
  }

  access(path: string[]) {
    let result = this.json;
    for (const pathPiece of path) {
      result = result[pathPiece];
    }
    return result;
  }

  loadFunctionAPIs() {
    const functionAPIPaths = [];
    const functionTypes = ["Method"];
    const iterator = this.dfs([], this.json);
    let iteration = iterator.next(true);
    while (!iteration.done) {
      const { node, path } = iteration.value;
      if (!isPrimitive(node)) {
        const { kindString } = node;
        if (isString(kindString)) {
          if (
            functionTypes.includes(kindString) &&
            !this.getNameOf(path).includes("__type")
          ) {
            functionAPIPaths.push(path);
            this.apis.push(this.makeFunctionAPI(path, node));
            iteration = iterator.next(false);
          } else {
            iteration = iterator.next(true);
          }
          continue;
        }
      }
      iteration = iterator.next(true);
    }
    return functionAPIPaths.map((path) => {
      return this.getNameOf(path);
    });
  }

  private getSource(path: string[]): TypedocSource[] | undefined {
    let currentPosition = this.json;
    let node;
    for (const pathPiece of path) {
      if (Array.isArray(currentPosition.sources)) {
        node = currentPosition;
      }
      currentPosition = currentPosition[pathPiece];
    }
    return node?.sources;
  }

  private getVersionFromTag(
    node: DeclarationReflection,
    tagName: string
  ): [string | undefined, string | undefined] {
    for (const signature of node.signatures || []) {
      for (const tag of signature.comment?.tags || []) {
        // @ts-expect-error
        if (tag.tag === tagName) {
          const text = tag.text;
          const versionLikes: string[] = [];
          const reg = /([0-9]+(\.[0-9]+)+)/g;
          let match;
          while ((match = reg.exec(text)) !== null) {
            versionLikes.push(match[0]);
          }
          return [versionLikes[0], text];
        }
      }
    }
    return [undefined, undefined];
  }

  private makeFunctionAPI(
    path: string[],
    node: DeclarationReflection
  ): FunctionAPI {
    const [deprecated, deprecatedFull] = this.getVersionFromTag(
      node,
      "deprecated"
    );
    const [since] = this.getVersionFromTag(node, "since");

    const relativeSource = this.getSource(path)?.find(() => true)!;
    return {
      name: this.getNameOf(path),
      accessPath: path,
      // @ts-ignore
      dtsSource: SourceLocator.locate(relativeSource, node.name),
      deprecatedVersion: deprecated,
      deprecationDetailed: deprecatedFull,
      sinceVersion: since,
    };
  }

  private getNameOf(path: string[]) {
    const namePath: string[] = [];
    let node = this.json;
    for (const pathPiece of path) {
      node = node[pathPiece];
      if (isNullish(node)) {
        break;
      }
      const { name, kindString } = node;
      if (isString(name) && isString(kindString)) {
        namePath.push(`${name}(${kindString})`);
      }
    }
    return namePath.join(".");
  }
}

class SourceLocator {
  static locate(startPosition: TypedocSource, symbol: string) {
    // TODO use ast to find symbol
    const fileContent = fs
      .readFileSync(
        path.resolve(extensionBase, "node_modules", startPosition.fileName)
      )
      .toString("utf-8");

    let index = 0;
    const offset = this.findIndex(fileContent, startPosition);
    const searchText = fileContent.slice(offset);
    function skipSpace() {
      while (searchText[index] === " " || searchText[index] === "\t") {
        index++;
      }
    }
    function skipSingleLineComment() {
      if (searchText[index] === "/") {
        if (searchText[index + 1] === "/") {
          index++;
          index++;
          let last: string, current: string;
          for (; ; index++) {
            last = searchText[index - 1];
            current = searchText[index];
            if (!last || !current || (last !== "\\" && current === "\n")) {
              break;
            }
          }
        }
      }
    }
    function skipMultilineComment() {
      if (searchText[index] === "/") {
        if (searchText[index + 1] === "*") {
          let last: string, current: string;
          for (; ; index++) {
            last = searchText[index - 1];
            current = searchText[index];
            if (!last || !current || (last === "*" && current === "/")) {
              break;
            }
          }
        }
      }
    }
    function skipWords() {
      while (/\w/.test(searchText[index])) {
        index++;
      }
    }
    for (;index < searchText.length;index++) {
      skipSpace();
      skipSingleLineComment();
      skipMultilineComment();
      const current = searchText[index];
      if (current === symbol[0]) {
        if (searchText.slice(index, index + symbol.length) === symbol) {
          break;
        } else {
          skipWords();
        }
      }
    }
    return this.findLocation(
      fileContent,
      offset + index + 1,
      startPosition.fileName
    );
  }

  static findIndex(content: string, position: TypedocSource) {
    const { line, character } = position;
    let lineNo = 1;
    let columnNo = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      if (line === lineNo && columnNo === character) {
        return i;
      }
      if (char === "\n") {
        lineNo++;
        columnNo = 0;
      } else {
        columnNo++;
      }
    }
    throw new Error(
      `cannot find index of line ${line} character ${character} in given content`
    );
  }

  static findLocation(
    content: string,
    index: number,
    fileName: string
  ): TypedocSource | undefined {
    if (isNaN(index)) {
      return undefined;
    }
    let lineNo = 1;
    let columnNo = 0;
    let i;
    for (i = 0; i <= index; i++) {
      if (content[i] === "\n") {
        lineNo++;
        columnNo = 0;
      } else {
        columnNo++;
      }
    }
    return {
      line: lineNo,
      character: columnNo,
      fileName,
    };
  }
}
