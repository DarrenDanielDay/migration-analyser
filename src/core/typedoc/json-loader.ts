import { isString } from "lodash";
import { assertIsNumber } from "../../utils";
import { fs, path, projectCacheDir } from "../../utils/paths";
import { isNullish, isPrimitive } from "../../utils/type-guards";

export interface TypedocSource {
  fileName: string;
  line: number;
  character: number;
}

export interface FunctionAPI {
  dtsSource: TypedocSource;
  accessPath: string[];
  name: string;
  sinceVersion?: string;
  deprecatedVersion?: string;
}

export class TypeDocJSONLoader {
  json: any;
  apis: FunctionAPI[] = [];
  objectMapping = new Map<number, any>();
  constructor(public readonly packageName: string) {}
  load() {
    this.json = JSON.parse(
      fs
        .readFileSync(
          path.resolve(
            projectCacheDir,
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
    const functionTypes = ["Call signature", "Method"];
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
            iteration = iterator.next(false);
          } else {
            iteration = iterator.next(true);
          }
          continue;
        }
      }
      iteration = iterator.next(true);
    }
    console.log(functionAPIPaths);
    
    console.log(functionAPIPaths.map(v => {
      return this.getSource(v);
    }))
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

  // @ts-ignore
  private makeFunctionAPI(path: string[], node: any): FunctionAPI {
    // return {
    //   name: this.getNameOf(path),
    //   accessPath: path,
    //   dtsSource
    // }
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
