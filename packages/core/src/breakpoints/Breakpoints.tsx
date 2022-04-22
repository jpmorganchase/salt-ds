const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

// Consider custom namespace..? declare namespace UITK
declare global {
  type BreakpointsType = {
    // This is slightly better than {}, but doesn't address the requirement of passing {a:1;} would trigger a TS error
    [name in string]: number;
  };
}

export type DefaultBreakpointType = typeof breakpoints;

/**
 * Used in util and internal functions to avoid lots of Generics passing around
 *
 * In the form of `{xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920}`
 **/
export type RelaxedBreakpointsType = {
  [name in string]: number;
};

export type StrictBreakpoints<T = DefaultBreakpointType> = {
  [name in keyof T]: number;
};

export type Breakpoints = BreakpointsType;

export const DEFAULT_BREAKPOINTS = breakpoints;
