import { isNumber, isString } from "lodash";
import { isNullish } from "./type-guards";

export function die(message: string): never {
  throw new Error(message);
}

export function notNullish<T>(o: T): asserts o is NonNullable<T> {
  isNullish(o) && die(`${o} is nullish`);
}

export function assertIsNumber(obj: any): asserts obj is number {
  isNumber(obj) || die(`${obj} is not number`);
}

export function assertIsString(obj: any): asserts obj is string {
  isString(obj) || die(`${obj} is not string`);
}
