export const makePrefixer =
  (prefix: string): ((...names: string[]) => string) =>
  (...names: string[]): string =>
    [prefix, ...names].join("-");
