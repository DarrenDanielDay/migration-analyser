import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import "../controller";
import { glob } from "glob";

class HTMLProcessor {
  private _html = "";
  public get html() {
    return this._html;
  }

  constructor(
    private readonly webview: vscode.Webview,
    private readonly context: vscode.ExtensionContext
  ) {}

  addHTMLTemplate(projectRelativePath: string) {
    this._html = fs
      .readFileSync(path.join(this.context.extensionPath, projectRelativePath))
      .toString("utf-8");
    return this;
  }

  addCSS(projectRelativeStaticCSSFolder: string) {
    const files = glob.sync(
      path.join(projectRelativeStaticCSSFolder, "**\\*.css"),
      { cwd: this.context.extensionPath }
    );

    this._html = this._html.replace(
      "{% STATIC_CSS %}",
      files
        .map(
          (file) =>
            `<link href="${urlOfFile(
              this.webview,
              this.context,
              file
            )}" rel="stylesheet" />`
        )
        .join("\n")
    );
    return this;
  }

  addStaticJS(projectRelativeStaticJSFolder: string) {
    const files = glob.sync(
      path.join(projectRelativeStaticJSFolder, "**\\*.js"),
      { cwd: this.context.extensionPath }
    ).reverse();
    this._html = this._html.replace(
      "{% STATIC_SCRIPT %}",
      files
        .map(
          (file) =>
            `<script src="${urlOfFile(
              this.webview,
              this.context,
              file
            )}"></script>`
        )
        .join("\n")
    );
    return this;
  }

  addEntryJS(projectRelativeEntryJSPath: string) {
    this._html = this._html.replace(
      "{% INDEX_JS %}",
      urlOfFile(this.webview, this.context, projectRelativeEntryJSPath)
    );
    return this;
  }
}

export class WebviewManager {
  panel: vscode.WebviewPanel | undefined;
  public messageHandler?: Parameters<vscode.Webview["onDidReceiveMessage"]>[0];
  private static _instance?: WebviewManager;
  static get instance() {
    return (this._instance ??= new WebviewManager());
  }
  private constructor() {}
  open(context: vscode.ExtensionContext) {
    if (this.panel) {
      return;
    }
    this.panel = vscode.window.createWebviewPanel(
      "react-ui",
      "Extension UI by React",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))],
      }
    );

    this.panel.onDidDispose((e) => {
      this.panel = undefined;
    });
    this.reload(context);
  }

  reload(context: vscode.ExtensionContext) {
    if (!this.panel) {
      console.warn("Please open panel first!");
      return;
    }
    // TODO Use webpack to make it easier.
    this.panel.webview.html = new HTMLProcessor(this.panel.webview, context)
      .addHTMLTemplate("src\\ui\\react-ui\\index.html")
      .addCSS("src\\ui\\react-ui\\static\\css")
      .addStaticJS("src\\ui\\react-ui\\static\\js")
      .addEntryJS("src\\ui\\react-ui\\dist\\src\\index.js").html;
  }

  close() {
    if (!this.panel) {
      return;
    }
    this.panel.dispose();
    this.panel = undefined;
  }

  attach(messageHandler: Parameters<vscode.Webview["onDidReceiveMessage"]>[0]) {
    if (this.messageHandler) {
      throw new Error("Cannot attach handler more than once!");
    }
    if (!this.panel) {
      throw new Error("Please open webview first!");
    }
    this.panel.webview.onDidReceiveMessage(
      (this.messageHandler = async (e) => {
        if (!this.panel) {
          return;
        }
        const result = await messageHandler(e);
        this.panel.webview.postMessage(result);
      })
    );
    return this;
  }
}

function urlOfFile(
  webview: vscode.Webview,
  context: vscode.ExtensionContext,
  relativePathToExtensionProject: string
): string {
  return webview
    .asWebviewUri(
      vscode.Uri.file(
        path.join(context.extensionPath, relativePathToExtensionProject)
      )
    )
    .toString();
}
