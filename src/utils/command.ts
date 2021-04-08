import * as child_process from "child_process";
export function executeCommand(
  command: string,
  cwd: string
): Promise<{
  success: boolean;
  stdout: string;
  stderr: string;
  err?: unknown;
}> {
  return new Promise((resolve) => {
    child_process.exec(command, { cwd }, (err, stdout, stderr) => {
      if (err != null) {
        return resolve({ success: false, stdout, stderr, err });
      }
      return resolve({ success: true, stdout, stderr });
    });
  });
}
