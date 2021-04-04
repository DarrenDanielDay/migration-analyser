import packageJson = require("package-json");
import { fs, path } from "../../utils/paths";
import { Version } from "./version";

export type VersionSpec = string;

export interface PackageJSON {
    dependencies: Record<string, VersionSpec>;
    devDependencies: Record<string, VersionSpec>;
}

export class PackageDetector {
    public readonly rootDir: string;
    public readonly packageJson: PackageJSON; 
    constructor(root: string) {
        this.rootDir = path.resolve(root);
        this.packageJson = this.getPackageJson();
    }
    
    private getPackageJson(): PackageJSON {
        const result = fs.readFileSync(path.resolve(this.rootDir, "package.json")).toString("utf-8")
        const json = JSON.parse(result);
        return {
            ...json,
            dependencies: json.dependencies || {},
            devDependencies: json.devDependencies || {}
        }
    }

    static async getPackageVersions(packageName: string) {
        const meta = await packageJson(packageName, {
            allVersions: true,
        })
        return Object.keys(meta.versions).map(version => Version.parse(version));
    }
}