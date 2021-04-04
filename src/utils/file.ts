import { fs } from "./paths";

export function getFileText(path: string) {
  return fs.readFileSync(path).toString("utf-8");
}
