import { createResponsiveSystem } from "./createResponsiveSystem";
export * from "./types";

const DEFAULT_BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
} as const;

const {
  BreakpointsProvider,
  useResponsiveProps,
  useResponsiveValue,
  makeResponsive,
  ResponsiveChildren,
} = createResponsiveSystem(DEFAULT_BREAKPOINTS);

export {
  BreakpointsProvider,
  useResponsiveProps,
  useResponsiveValue,
  makeResponsive,
  createResponsiveSystem,
  ResponsiveChildren,
  DEFAULT_BREAKPOINTS,
};
