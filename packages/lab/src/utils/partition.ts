export function partition<T = unknown>(
  array: T[],
  predicate: (value: T) => boolean,
  pass: T[] = [],
  fail: T[] = []
): [T[], T[]] {
  for (let i = 0, len = array.length; i < len; i++) {
    (predicate(array[i]) ? pass : fail).push(array[i]);
  }
  return [pass, fail];
}
