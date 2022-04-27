export type DefaultBreakpointType = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

declare global {
  interface BreakpointsType extends Record<string, never> {}
}

export type Breakpoints<T = BreakpointsType> = T extends Record<string, never>
  ? DefaultBreakpointType
  : T;

type CustomBreakpoints = Breakpoints<{ mobile: number }>;
// expected TS Error: Property 'mobile' is missing in type '{}' but required in type '{ mobile: number; }'.ts(2741)
const C: CustomBreakpoints = {};
// expected TS Error: Type '{}' is missing the following properties from type 'DefaultBreakpointType': xs, sm, md, lg, xlts(2739)
const B: Breakpoints = {};

const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

export const DEFAULT_BREAKPOINTS = breakpoints;
