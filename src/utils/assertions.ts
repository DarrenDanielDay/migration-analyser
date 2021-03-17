export function notNullish<T>(o: T): asserts o is NonNullable<T> {
  if (o == null) {
    throw new Error(`${o} is null`);
  }
}
