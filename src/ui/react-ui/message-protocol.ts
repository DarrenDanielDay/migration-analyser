// Define your protocol here, and implement them in `controllers` with best practice!
export type VersionSpec = string;

export interface PackageJSON {
  dependencies: Record<string, VersionSpec>;
  devDependencies: Record<string, VersionSpec>;
}
export interface IVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly preview?: string;
}
export interface TypedocSource {
  fileName: string;
  line: number;
  character: number;
}

export interface DeprecatedItem {
  name: string;
  accessPath: string[];
  useInstead?: any;
}

export interface DiffParams {
  packageName: string;
  from: IVersion;
  to:IVersion;
}

export type CorrectItem = TypedocSource

export interface UIRequestExtensionProtocol {
  logInput: Protocol<string, string>;
  /**
   * Returns true if succeeded.
   */
  loadProject: Protocol<undefined, boolean>;
  /**
   * Returns all package names
   */
  getAllPackages: Protocol<undefined, PackageJSON>;
  /**
   * Return all version of a package
   */
  getAllVersions: Protocol<string, IVersion[]>;
  /**
   * Return the between two version
   */
  diff: Protocol<DiffParams, DeprecatedItem[]>;
  /**
   * Find the position that needed to be changed.
   */
  correct: Protocol<DeprecatedItem, CorrectItem[]>
}

export type MessageType = "request" | "response";

export interface Message<T> {
  type: MessageType;
  seq: number;
  command: ProtocalCommand;
  payload: T;
  hasError: boolean;
}

export interface Request<T> extends Message<T> {
  type: "request";
}

export interface Response<T> extends Message<T> {
  type: "response";
}

export interface Protocol<P, R> {
  request: P;
  response: R;
}

export type ProtocalCommand = keyof UIRequestExtensionProtocol;

export type UIRequestController = {
  [K in ProtocalCommand]: (
    param: UIRequestExtensionProtocol[K]["request"]
  ) => Promise<UIRequestExtensionProtocol[K]["response"]>;
};
