import { readFileSync } from "fs";
import { join, resolve } from "path";
import * as typedoc from "typedoc";
import { ensureDirectoriesExist } from "typedoc/dist/lib/utils";
import { extensionBase, extensionCacheDir } from "../../utils/paths";

export async function geneTypeDoc(packageName: string) {
  const typeDeclPath = resolve(
    extensionBase,
    "node_modules",
    "@types",
    packageName
  );
  const entryPoints: string[] = [typeDeclPath];
  const app = new typedoc.Application();
  app.options.addReader(new typedoc.TSConfigReader());
  app.options.addReader(new typedoc.TypeDocReader());
  app.bootstrap({
    entryPoints,
  });
  const outDir = join(extensionCacheDir, packageName);
  ensureDirectoriesExist(outDir);
  const jsonFileName = `${packageName}.json`;
  const jsonFilePath = join(outDir, jsonFileName);
  const project = app.convert();
  if (project) {
    // await app.generateDocs(project, outDir);
    await app.generateJson(project, jsonFilePath);
    const content = readFileSync(jsonFilePath).toString("utf-8");
    return JSON.parse(content) as typedoc.ProjectReflection;
  } else {
    throw new Error("Failed to convert project.");
  }
}
