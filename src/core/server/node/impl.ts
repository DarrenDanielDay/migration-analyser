import * as child_process from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as protocol from "typescript/lib/protocol";
import { PickKey, withType } from "../../../utils";
import { TypeScriptRequests } from "../src/typescriptService";
import { ChildServerProcess } from "../src/tsServer/serverProcess.electron";
import { TsServerProcessKind } from "../src/tsServer/server";
import { TypeScriptServiceConfiguration } from "../src/utils/configuration";
import { notNullish } from "../../../utils/assertions";
import { TSServerStdoutReader } from "./stdout-reader";
const projectBase =
  "C:\\Users\\DarrenDanielDay\\Documents\\School\\paper\\vscode-extension-demo";
interface PendingRequestItem {
  resolve: (data: any) => void;
  reject: (reason?: any) => void;
  seq: number;
}

export class MyTypeScriptServer {
  private static _instance?: MyTypeScriptServer = undefined;
  public static readonly nonResponseCommand: PickKey<
    TypeScriptRequests,
    | "open"
    | "close"
    | "compilerOptionsForInferredProjects"
    | "change"
    | "reloadProjects"
    | "configure"
  >[] = [
    "change",
    "close",
    "compilerOptionsForInferredProjects",
    "configure",
    "open",
    "reloadProjects",
  ];
  static get instance() {
    return (this._instance ??= new MyTypeScriptServer());
  }
  childProcess?: child_process.ChildProcess;
  tsserver?: string;
  reader: TSServerStdoutReader = new TSServerStdoutReader();
  pendingRequests: Map<number, PendingRequestItem> = new Map<
    number,
    PendingRequestItem
  >();
  start() {
    const tsserver =
      this.tsserver ??
      path.resolve(projectBase, "node_modules", ".bin", "tsserver.cmd");
    this.childProcess ??= child_process.spawn(tsserver, [], {
      // silent: true,
      shell: true,
      cwd: undefined,
      // @ts-expect-error
      env: ChildServerProcess.generatePatchedEnv(process.env, tsserver),
      // @ts-expect-error
      execArgv: ChildServerProcess.getExecArgv(
        TsServerProcessKind.Semantic,
        TypeScriptServiceConfiguration.loadFromWorkspace()
      ),
    })!;
    const stdout = this.childProcess.stdout!;
    this.reader.onResponse((response) => {
      const item = this.pendingRequests.get(response.request_seq);
      notNullish(item);
      const { resolve, reject } = item;
      response.success ? resolve(response) : reject(response);
    });
    stdout.on("data", (chunk: Buffer) => {
      const rawResponse = chunk.toString("utf-8");
      console.log(`*`.repeat(100));
      console.log(rawResponse);
      fs.writeFileSync(
        path.resolve(projectBase, "tsserver-output.txt"),
        rawResponse,
        { flag: "a" }
      );
      console.log(`-`.repeat(100));
      this.resolveChunk(chunk);
    });
  }

  private resolveChunk(chunk: Buffer) {
    this.reader.feedChunk(chunk);
  }

  stop() {
    this.childProcess?.kill(9);
    this.childProcess = undefined;
    this.seq = 0;
    this.reader.dispose();
  }

  seq = 0;

  get nextSeq() {
    return this.seq++;
  }

  async execute<Command extends keyof TypeScriptRequests>(
    command: Command,
    request: TypeScriptRequests[Command][0]
  ): Promise<TypeScriptRequests[Command][1]> {
    const { childProcess, nextSeq } = this;

    return new Promise<TypeScriptRequests[Command][1]>((resolve, reject) => {
      if (
        MyTypeScriptServer.nonResponseCommand.find((cmd) => cmd === command)
      ) {
        setTimeout(() => {
          resolve(null);
        }, 0)
      }
      this.pendingRequests.set(nextSeq, { seq: nextSeq, resolve, reject });
      childProcess!.stdin!.write(
        JSON.stringify(
          withType<protocol.Request>({
            seq: nextSeq,
            type: "request",
            command,
            arguments: request,
          })
        ) + "\r\n"
      );
    });
  }
}
