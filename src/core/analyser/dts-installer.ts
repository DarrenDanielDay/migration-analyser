import { executeCommand } from "../../utils/command";

export class DTSInstaller {
  static async install(packageName: string, projectFolder: string) {
    const result = await executeCommand(
      `yarn add -D "@types/${packageName}"`,
      projectFolder
    );
    return result;
  }
}
