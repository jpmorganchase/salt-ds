export type ClassNamePrefixer = (...names: string[]) => string;
export const makePrefixer =
  (prefix: string): ClassNamePrefixer =>
  (...names: string[]): string =>
    [prefix, ...names].join("-");
