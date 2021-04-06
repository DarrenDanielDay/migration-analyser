import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import protocol = require("typescript/lib/protocol");
import { MyTypeScriptServer } from "../server/node";

export class ProjectLoader {
  private static _instance?: ProjectLoader;
  static get instance() {
    return this._instance ?? new ProjectLoader();
  }
  dispose() {
    this.server.stop();
  }
  server = new MyTypeScriptServer().start();
  loadedProjectName?: string;
  load(projectFolder: string) {
    const tsconfigPath = path.resolve(projectFolder, "tsconfig.json");
    return new Promise<void>(async (resolve, reject) => {
      if (!fs.existsSync(tsconfigPath)) {
        return reject(new Error("No tsconfig.json found in project."));
      }
      await this.server.execute("open", {
        file: tsconfigPath,
        projectRootPath: projectFolder,
      });
      const loadStartHandler = (payload: protocol.ProjectLoadingStartEvent) => {
        if (path.resolve(payload.body.projectName) === tsconfigPath) {
          this.server.eventEmitter.off("projectLoadingStart", loadStartHandler);
          const loadEndHandler = (
            payload: protocol.ProjectLoadingFinishEvent
          ) => {
            if (path.resolve(payload.body.projectName) === tsconfigPath) {
              this.server.eventEmitter.off(
                "projectLoadingFinish",
                loadEndHandler
              );
              this.loadedProjectName = tsconfigPath;
              resolve();
            }
          };
          this.server.eventEmitter.on("projectLoadingFinish", loadEndHandler);
        }
      };
      this.server.eventEmitter.on("projectLoadingStart", loadStartHandler);
    });
  }
}
