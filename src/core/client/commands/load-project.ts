import { absolutePath } from "../../../utils/paths";

import * as vscode from "vscode";
import { ProjectLoader } from "../../analyser/project-loader";

export async function loadProject() {
  const editor = vscode.window.activeTextEditor;
  const section = editor?.selection;
  let filename = editor?.document.fileName;
  if (section && filename) {
    filename = absolutePath(filename);
    const loader = new ProjectLoader();
    const instance = loader.server;
    await loader.load(projectRoot());
    const data = {
      line: section.start.line + 1,
      offset: section.start.character + 1,
      file: filename,
      projectFileName: loader.loadedProjectName,
    };
    const { body } = await instance.execute("references", data);
    const refs = body!;
    for (const ref of refs!.refs) {
      console.log(ref);
    }
    loader.dispose();
  }
}

function projectRoot(): string {
  return absolutePath(vscode.workspace.workspaceFolders![0].uri.fsPath);
}
