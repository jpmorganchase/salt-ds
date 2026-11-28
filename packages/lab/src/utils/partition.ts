/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export function partition<T = unknown>(
  array: T[],
  predicate: (value: T) => boolean,
  pass: T[] = [],
  fail: T[] = [],
): [T[], T[]] {
  for (let i = 0, len = array.length; i < len; i++) {
    (predicate(array[i]) ? pass : fail).push(array[i]);
  }
  return [pass, fail];
}
