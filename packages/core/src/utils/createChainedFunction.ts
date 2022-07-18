/* eslint-disable @typescript-eslint/no-explicit-any */

type ChainedFunction<Args extends any[], This> =
  | ((this: This, ...args: Args) => any)
  | undefined
  | null;

export function createChainedFunction<Args extends any[], This>(
  ...funcs: ChainedFunction<Args, This>[]
): (this: This, ...args: Args) => any {
  return funcs.reduce<(this: This, ...args: Args) => any>(
    (acc, func) => {
      if (func == null) {
        return acc;
      }

      return function chainedFunction(...args) {
        acc.apply(this, args);
        func.apply(this, args);
      };
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {}
  );
}
