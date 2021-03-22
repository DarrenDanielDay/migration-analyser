import * as child_process from "child_process";
import * as path from "path";
import * as fs from "fs";
import { generateDoneMessage } from "../../utils/constants";
import { projectBase } from "../../utils/paths";
import { ProjectReflection } from "typedoc";

export function scriptGeneTypeDocJson(packageName: string) {
  const child = child_process.spawn(
    path.resolve(projectBase, "src", "scripts", "gene-json.cmd "),
    [packageName],
    {
      cwd: projectBase,
    }
  );
  return new Promise<ProjectReflection>((resolve, reject) => {
    child.stdout.on("data", (c: Buffer) => {
      const info = c.toString("utf-8");
      console.log(info);
      if (info.includes(generateDoneMessage)) {
        const json = fs
          .readFileSync(
            path.resolve(
              projectBase,
              "out",
              "cache",
              packageName,
              `${packageName}.json`
            )
          )
          .toString("utf-8");
        resolve(JSON.parse(json) as ProjectReflection);
      }
    });
  });
}