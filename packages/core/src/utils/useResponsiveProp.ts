import { Breakpoints } from "../breakpoints";
import { useBreakpoints } from "../toolkit-provider";
import { useViewport } from "../viewport";

type BreakpointProp<T> = {
  [K in keyof Breakpoints]?: T;
};

export type ResponsiveProp<T> = T | BreakpointProp<T>;

export const getCurrentBreakpoint = (
  breakpoints: Breakpoints,
  width: number
) => {
  const breakpointList = Object.entries(breakpoints);

  const [currentBreakpoint] = (
    breakpointList as [keyof Breakpoints, number][]
  ).reduce((acc, val) => {
    const [, accWidth] = acc;
    const [breakpoint, breakpointWidth] = val;
    if (breakpointWidth < width && breakpointWidth > accWidth) {
      return [breakpoint, breakpointWidth];
    }
    return [...acc];
  }, breakpointList[0] as [keyof Breakpoints, number]);

  return currentBreakpoint;
};

export const useCurrentBreakpoint = () => {
  const viewport = useViewport();

  const breakpoints = useBreakpoints();

  return getCurrentBreakpoint(breakpoints, viewport);
};

export const useOrderedBreakpoints = () => {
  const breakpoints = useBreakpoints();

  const orderedBreakpoints = Object.entries(breakpoints)
    .sort(([, a], [, b]) => a - b)
    .map(([key]) => key);

  return orderedBreakpoints;
};

const isObject = <T>(
  value: T
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): value is Record<string | number | symbol, any> => {
  const type = typeof value;
  return value !== null && (type === "object" || type === "function");
};

const hasBreakpointValues = <T>(
  value: ResponsiveProp<T>,
  breakpoints: Breakpoints
): value is BreakpointProp<T> => {
  return (
    isObject(value) && Object.keys(value).every((key) => key in breakpoints)
  );
};

const getResponsiveValue = <T>(
  breakpointValues: BreakpointProp<T>,
  breakpoints: Breakpoints,
  viewport: keyof Breakpoints,
  defaultValue: T
) => {
  const value = Object.entries(breakpointValues).reduce<[number, T]>(
    (acc, val) => {
      const [accWidth] = acc;
      const [breakpoint, breakpointValue] = val;

      const breakpointWidth =
        breakpoints[breakpoint as keyof typeof breakpoints];

      if (
        breakpointWidth >= accWidth &&
        breakpointWidth <= breakpoints[viewport]
      ) {
        return [breakpointWidth, breakpointValue];
      }

      return acc;
    },
    [0, defaultValue]
  )[1];

  return value;
};

export const useResponsiveProp = <T>(
  value: ResponsiveProp<T>,
  defaultValue: T
) => {
  const breakpoints = useBreakpoints();
  const viewport = useViewport();

  const currentViewport = getCurrentBreakpoint(breakpoints, viewport);

  if (hasBreakpointValues(value, breakpoints)) {
    return getResponsiveValue(
      value,
      breakpoints,
      currentViewport,
      defaultValue
    );
  }
  return value;
};
