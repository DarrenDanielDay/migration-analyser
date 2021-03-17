import { EventEmitter } from "events";
import * as protocol from "typescript/lib/protocol";
const NEWLINE = "\n";
const EMPTY_STRING = "";
export class TSServerStdoutReader {
  emitter = new EventEmitter();
  state: ReaderState = ReaderState.ExpectingContentLength;
  contentLength = -1;
  private detatchers: (() => void)[] = [];
  onEvent(handler: (event: protocol.Event) => void) {
    this.emitter.on("event", handler);
    this.detatchers.push(() => {
      this.emitter.off("event", handler);
    });
  }

  onServerRequest(handler: (request: protocol.Request) => void) {
    this.emitter.on("request", handler);
    this.detatchers.push(() => {
      this.emitter.off("request", handler);
    });
  }

  onResponse(handler: (response: protocol.Response) => void) {
    this.emitter.on("response", handler);
    this.detatchers.push(() => {
      this.emitter.off("response", handler);
    });
  }

  feedChunk(chunk: Buffer) {
    const text = chunk.toString("utf-8");
    const lines = text.split(NEWLINE);
    if (lines[lines.length - 1] !== EMPTY_STRING || lines.length % 3 !== 1) {
      throw new Error("Unexpected chunk format");
    }
    for (let i = 0; i < lines.length - 1; i++) {
      this.feedLine(lines[i]);
    }
  }

  feedLine(line: string) {
    switch (this.state) {
      case ReaderState.ExpectingContentLength:
        const matchResult = /Content-Length: (\d+)/.exec(line);
        if (!matchResult) {
          throw new Error("Unexpected content length message");
        }
        this.contentLength = parseInt(matchResult[1]);
        this.state = ReaderState.ExpectingSpaceDivider;
        break;
      case ReaderState.ExpectingSpaceDivider:
        this.state = ReaderState.ExpectingData;
        break;
      case ReaderState.ExpectingData:
        if (this.contentLength !== line.length) {
          throw new Error("Unexpected length of payload");
        }
        const data = JSON.parse(line) as protocol.Message;
        switch (data.type) {
          case "request":
            this.handleRequest(data as protocol.Request);
            break;
          case "event":
            this.handleEvent(data as protocol.Event);
            break;
          case "response":
            this.handleData(data as protocol.Response);
            break;
          default:
            throw new Error("Unexpected data type");
        }
        this.state = ReaderState.ExpectingContentLength;
        this.contentLength = -1;
        break;
      default:
        throw new Error("Unexpected State");
    }
  }

  private handleData(data: protocol.Response) {
    this.emitter.emit(data.type, data);
  }

  private handleRequest(data: protocol.Request) {
    this.emitter.emit(data.type, data);
  }

  private handleEvent(data: protocol.Event) {
    this.emitter.emit(data.type, data);
  }
  dispose() {
    for (const detatcher of this.detatchers) {
      detatcher.call(undefined);
    }
  }
}

enum ReaderState {
  ExpectingContentLength,
  ExpectingSpaceDivider,
  ExpectingData,
}
