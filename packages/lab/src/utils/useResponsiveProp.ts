import { Breakpoints, useBreakpoints, useViewport } from "@brandname/core";

type BreakpointProp<T> = {
  [K in keyof Breakpoints]?: T;
};

export type ResponsiveProp<T> = T | BreakpointProp<T>;

const getCurrentBreakpoint = (breakpoints: Breakpoints, width: number) => {
  const breakpointList = Object.entries(breakpoints);

  const [currentBreakpoint] = (
    breakpointList as [keyof Breakpoints, number][]
  ).reduce((acc, val) => {
    const [_, accWidth] = acc;
    const [breakpoint, breakpointWidth] = val;
    if (breakpointWidth < width && breakpointWidth > accWidth) {
      return [breakpoint, breakpointWidth];
    }
    return [...acc];
  }, breakpointList[0] as [keyof Breakpoints, number]);

  return currentBreakpoint;
};

const isObject = <T extends any>(
  value: T
): value is Record<string | number | symbol, any> => {
  const type = typeof value;
  return value !== null && (type === "object" || type === "function");
};

const hasBreakpointValues = <T extends any>(
  value: ResponsiveProp<T>,
  breakpoints: Breakpoints
): value is BreakpointProp<T> => {
  return (
    isObject(value) && Object.keys(value).every((key) => key in breakpoints)
  );
};

const getResponsiveValue = <T extends any>(
  breakpointValues: BreakpointProp<T>,
  breakpoints: Breakpoints,
  viewport: keyof Breakpoints,
  defaultValue: T
) => {
  const value = Object.entries(breakpointValues).reduce<
    [number, T] | [never, unknown]
  >(
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

export const useResponsiveProp = <T extends any>(
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
