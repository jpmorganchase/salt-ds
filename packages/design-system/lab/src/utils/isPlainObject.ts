export const isPlainObject = (obj: Record<never, never>): boolean =>
  Object.prototype.toString.call(obj) === "[object Object]";
