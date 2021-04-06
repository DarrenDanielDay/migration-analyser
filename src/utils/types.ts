export type PickKey<T extends object, K extends keyof T> = K;
export type PrimitiveTypes =
  | string
  | number
  | boolean
  | undefined
  | null
  | symbol
  | bigint;