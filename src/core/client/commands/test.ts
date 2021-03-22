import {
  absolutePath,
} from "../../../utils/paths";
import * as vscode from "vscode";
import { ProjectLoader } from "../../analyser/loader";
export async function test(context: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor;
  const section = editor?.selection;
  let filename = editor?.document.fileName;
  if (section && filename) {
    filename = absolutePath(filename);
    const loader = new ProjectLoader();
    const instance = loader.server;
    // const tsconfigPath = path.join(projectRoot()!, "tsconfig.json");
    await loader.load(projectRoot());
    // await instance.execute("open", {
    //   file: tsconfigPath,
    //   projectRootPath: projectRoot(),
    // });
    // await instance.execute("open", {
    //   file: filename,
    //   projectRootPath: projectRoot(),
    // })
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
  }
}

function projectRoot(): string {
  return absolutePath(vscode.workspace.workspaceFolders![0].uri.fsPath);
}
