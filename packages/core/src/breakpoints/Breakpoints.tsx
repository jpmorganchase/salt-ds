declare global {
  interface BreakpointsType {}
}

export type Breakpoints = BreakpointsType;

const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

export const DEFAULT_BREAKPOINTS = breakpoints;
