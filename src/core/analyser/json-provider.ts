import { join, resolve } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { extensionBase, extensionCacheDir } from "../../utils/paths";
import { geneTypeDoc } from "../typedoc/doc-json";
import { scriptGeneTypeDocJson } from "../typedoc/script-gene-doc-json";
import { ProjectReflection } from "typedoc";
const encoding = "utf-8";
export async function getTypeDocJson(
  packageName: string,
  noCache?: boolean
): Promise<ProjectReflection> {
  const jsonPath = resolve(extensionCacheDir, packageName, `${packageName}.json`);
  if (existsSync(jsonPath) && !noCache) {
    return JSON.parse(
      readFileSync(jsonPath).toString(encoding)
    ) as ProjectReflection;
  }

  const json = await scriptGeneTypeDocJson(packageName);
  return json;
}
