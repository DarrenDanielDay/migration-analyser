import {
  DeprecatedItem,
  DiffParams,
  UIRequestController,
} from "../react-ui/message-protocol";
import * as vscode from "vscode";
import { Controller, Inject } from "./controller-decorator";
import { ProjectLoader } from "../../core/analyser/project-loader";
import { PackageDetector, PackageJSON } from "../../core/analyser/package";
import { IVersion } from "../../core/analyser/version";
import { dieMessage } from "../../utils/message";
import { absolutePath, extensionBase } from "../../utils/paths";
import { DTSInstaller } from "../../core/analyser/dts-installer";
import { TypedocJSONGenerator } from "../../core/typedoc/json-generator";

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
    const detector = new PackageDetector(
      ProjectLoader.instance.loadedProjectRoot!
    );
    return detector.packageJson;
  }
  /**
   * Return all version of a package
   */
  async getAllVersions(pkg: string): Promise<IVersion[]> {
    const result = await PackageDetector.getPackageVersions(pkg);
    const loader = ProjectLoader.instance;
    if (loader.loadedProjectRoot) {
      Promise.all([
        DTSInstaller.install(pkg, loader.loadedProjectRoot),
        DTSInstaller.install(pkg, extensionBase),
      ]).then(([execResult, extensionResult]) => {
        if (execResult.success) {
          this.channel.appendLine("+".repeat(100));
          this.channel.appendLine(execResult.stdout);
          this.channel.appendLine("-".repeat(100));
        } else {
          this.channel.appendLine("+".repeat(100));
          this.channel.appendLine(execResult.stdout);
          this.channel.appendLine(execResult.stderr);
          this.channel.appendLine("-".repeat(100));
          vscode.window.showInformationMessage(
            `Package ${pkg} has no @types repo and may not support refactorization!`
          );
        }
      });
    }
    return result;
  }
  /**
   * Return the between two version
   */
  diff(param: DiffParams): Promise<DeprecatedItem[]> {
    TypedocJSONGenerator.generate(param.packageName)
    return dieMessage("no impl");
  }
  /**
   * Find the position that needed to be changed.
   */
  correct(): Promise<[]> {
    return dieMessage("no impl");
  }
}
