/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const isPlainObject = (obj: Record<never, never>): boolean =>
  Object.prototype.toString.call(obj) === "[object Object]";
