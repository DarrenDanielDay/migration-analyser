import { resolve } from "path";
import * as fs from "fs";
import { capitalize } from "lodash";
import { title } from "./string";
export const testProjectHome = "E:\\Coding\\Playground\\ts-playground\\";
const projectBase = resolve(__dirname, "../../");
const projectCacheDir = resolve(projectBase, "out/cache");
const scriptDir = resolve(projectBase, "scripts")
if (!fs.existsSync(projectCacheDir)) fs.mkdirSync(projectCacheDir);
export function absolutePath(path: string) {
    return normalizeDrive(resolve(path));
}

function normalizeDrive(path: string) {
    return /^\w:/.test(path) ? title(path) : path
}

export { projectBase, projectCacheDir };
