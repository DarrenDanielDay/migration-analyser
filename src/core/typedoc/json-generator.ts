import { geneTypeDoc } from "./doc-json";

export class TypedocJSONGenerator {
    static async generate(pkg: string) {
        return geneTypeDoc(pkg);
    }
}