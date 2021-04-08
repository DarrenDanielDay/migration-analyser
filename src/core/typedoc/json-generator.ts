import { ProjectReflection } from "typedoc";
import { extensionBase, fs, path } from "../../utils/paths";
import { scriptGeneTypeDocJson } from "./script-gene-doc-json";

export class TypedocJSONGenerator {
  static hasCache(pkg: string) {
    return fs.existsSync(TypedocJSONGenerator.jsonPathOfPackage(pkg));
  }
  private static jsonPathOfPackage(pkg: string): fs.PathLike {
    return path.resolve(extensionBase, "out", "cache", pkg, `${pkg}.json`);
  }

  static async generate(pkg: string) {
    if (this.hasCache(pkg)) {
      const json = fs
        .readFileSync(this.jsonPathOfPackage(pkg))
        .toString("utf-8");
      return JSON.parse(json) as ProjectReflection;
    }
    return this.doGenerate(pkg);
  }
  static async doGenerate(pkg: string) {
    return scriptGeneTypeDocJson(pkg);
  }
}
