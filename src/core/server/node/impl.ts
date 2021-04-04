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
import { logger } from "../../../utils/debugger";
import { EventEmitter } from "events";
const projectBase =
  "C:\\Users\\DarrenDanielDay\\Documents\\School\\paper\\package-migration-analyzer-extension";
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
  /**
   * Emitter for tsserve's events.
   */
  eventEmitter = new EventEmitter();
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
      this.pendingRequests.delete(response.request_seq);
      notNullish(item);
      const { resolve, reject } = item;
      response.success ? resolve(response) : reject(response.message);
    });
    this.reader.onEvent((event) => {
      this.eventEmitter.emit(event.event, event);
    });
    stdout.on("data", (chunk: Buffer) => {
      const rawResponse = chunk.toString("utf-8");
      logger.block("TS Server Data", rawResponse);
      this.resolveChunk(chunk);
    });
    return this;
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
        }, 0);
      }
      this.pendingRequests.set(nextSeq, { seq: nextSeq, resolve, reject });
      const requestPayload =
        JSON.stringify(
          withType<protocol.Request>({
            seq: nextSeq,
            type: "request",
            command,
            arguments: request,
          })
        ) + "\r\n";
      childProcess!.stdin!.write(requestPayload);
      logger.block("Request Payload", requestPayload);
    });
  }
}
