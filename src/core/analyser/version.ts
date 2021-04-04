export type VersionSpec = string;

export interface IVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
}
 
export interface IVersionComparator {
  lt(version: IVersion): boolean;
  gt(version: IVersion): boolean;
  eq(version: IVersion): boolean;
}

export class Version implements IVersion, IVersionComparator {
  private _major: number;
  private _minor: number;
  private _patch: number;
  constructor(major: number = 0, minor: number = 0, patch: number = 0) {
    this._major = ~~major;
    this._minor = ~~minor;
    this._patch = ~~patch;
  }

  static versionTuple(version: IVersion) {
    return [version.major, version.minor, version.patch] as const;
  }

  static parse(versionString: string) {
    const versions: number[] = versionString.split(/\D+/).filter(s => !!s).map(num => +num);
    if (!versions.length) versions.push(0);
    return new Version(...versions);
  }

  lt(version: IVersion): boolean {
    const t1 = Version.versionTuple(this);
    const t2 = Version.versionTuple(version);
    for (const i of [0, 1, 2] as const) {
      if (t1[i] !== t2[i]) {
        return t1[i] < t2[i];
      }
    }
    return false;
  }
  gt(version: IVersion): boolean {
    const t1 = Version.versionTuple(this);
    const t2 = Version.versionTuple(version);
    for (const i of [0, 1, 2] as const) {
      if (t1[i] !== t2[i]) {
        return t1[i] > t2[i];
      }
    }
    return false;
  }
  eq(version: IVersion): boolean {
    return (
      this.major === version.major &&
      this.minor === version.minor &&
      this.patch === version.patch
    );
  }
  get major(): number {
    return this._major;
  }
  get minor(): number {
    return this._minor;
  }
  get patch(): number {
    return this._patch;
  }
}
