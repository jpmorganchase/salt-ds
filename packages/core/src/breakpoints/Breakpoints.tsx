const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

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

export type Breakpoints = RelaxedBreakpointsType;

export const DEFAULT_BREAKPOINTS = breakpoints;
