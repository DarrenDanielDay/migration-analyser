import * as path from "path";
import * as fs from "fs";
import { title } from "./string";
const resolve = path.resolve;
export const testProjectHome = "E:\\Coding\\Playground\\ts-playground\\";
const projectBase = normalizeDrive(resolve(__dirname, "../../"));
const projectCacheDir = resolve(projectBase, "out/cache");
// const scriptDir = resolve(projectBase, "scripts")
if (!fs.existsSync(projectCacheDir)) fs.mkdirSync(projectCacheDir);
export function absolutePath(path: string) {
  return normalizeDrive(resolve(path));
}

function normalizeDrive(path: string) {
  return /^\w:/.test(path) ? title(path) : path;
}
export { path, fs };
export { projectBase as extensionBase, projectCacheDir as extensionCacheDir };
