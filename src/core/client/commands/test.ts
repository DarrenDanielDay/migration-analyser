import * as vscode from "vscode";
import { TypeDocJSONLoader } from "../../typedoc/json-loader";
import { loadProject } from "./load-project";
export async function test(context: vscode.ExtensionContext) {
  await loadProject();
}
