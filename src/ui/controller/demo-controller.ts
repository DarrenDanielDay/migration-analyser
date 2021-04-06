import {
  DeprecatedItem,
  UIRequestController,
} from "../react-ui/message-protocol";
import * as vscode from "vscode";
import { Controller, Inject } from "./controller-decorator";
import { ProjectLoader } from "../../core/analyser/project-loader";
import { PackageJSON } from "../../core/analyser/package";
import { die } from "../../utils";
import { IVersion } from "../../core/analyser/version";
import { dieMessage } from "../../utils/message";
import { absolutePath } from "../../utils/paths";

@Controller
export class DemoController implements UIRequestController {
  @Inject.singleTone(() =>
    vscode.window.createOutputChannel("vscode-react-ui-demo Logger")
  )
  private readonly channel!: vscode.OutputChannel;
  @Inject.context()
  private readonly context!: vscode.ExtensionContext;
  async logInput(params: string) {
    // Suppose sometimes methods of controller crashed:
    if (Math.random() < 0.5) {
      throw new Error("Sorry, crashed!");
    }
    this.channel.appendLine(params);
    return `The log <${params}> has been logged into OUTPUT "vscode-react-ui-demo Logger". You can find them by "Ctrl + Shift + U" `;
  }
  /**
   * Returns true if succeeded.
   */
  async loadProject(): Promise<boolean> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || !folders.length) {
      return dieMessage("Please open a folder as workspace first!");
      
    }
    await ProjectLoader.instance.load(absolutePath(folders[0].uri.fsPath));
    return true;
  }
  /**
   * Returns all package names
   */
  async getAllPackages(): Promise<PackageJSON> {
    return dieMessage("no impl");
  }
  /**
   * Return all version of a package
   */
  getAllVersions(): Promise<IVersion[]> {
    return dieMessage("no impl");
  }
  /**
   * Return the between two version
   */
  diff(): Promise<DeprecatedItem[]> {
    return die("no impl");
  }
  /**
   * Find the position that needed to be changed.
   */
  correct(): Promise<[]> {
    return die("no impl");
  }
}
