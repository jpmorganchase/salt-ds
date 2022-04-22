import {
  RelaxedBreakpointsType,
  useBreakpoints,
  useViewport,
} from "@brandname/core";

type BreakpointValue<T, B> = {
  [K in keyof B]: T;
};

export type ResponsiveProp<T, B> = T | BreakpointValue<T, B>;

const getCurrentBreakpoint = (
  breakpoints: RelaxedBreakpointsType,
  width: number
) => {
  const breakpointList = Object.entries(breakpoints);

  const [currentBreakpoint] = breakpointList.reduce((acc, val) => {
    const [_, accWidth] = acc;
    const [breakpoint, breakpointWidth] = val;
    if (breakpointWidth < width && breakpointWidth > accWidth) {
      return [breakpoint, breakpointWidth];
    }
    return [...acc];
  }, breakpointList[0]);

  return currentBreakpoint;
};

const isObject = (
  value: unknown
): value is Record<string | number | symbol, any> => {
  const type = typeof value;
  return value !== null && (type === "object" || type === "function");
};

const hasBreakpointValues = <T, B>(
  value: ResponsiveProp<T, B>,
  breakpoints: RelaxedBreakpointsType
): value is BreakpointValue<T, B> => {
  return (
    isObject(value) && Object.keys(value).every((key) => key in breakpoints)
  );
};

export const getResponsiveValue = <T, B>(
  breakpointValues: BreakpointValue<T, B>,
  breakpoints: RelaxedBreakpointsType,
  viewport: string,
  defaultValue: T
): T => {
  const value = Object.entries(breakpointValues).reduce<
    [number, unknown] | [never, unknown]
  >(
    (acc, val) => {
      const [accWidth] = acc;
      const [breakpointName, breakpointValue] = val;

      // TODO: Do some thorough check around typeof breakpoints being object
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const breakpointWidth = breakpoints[breakpointName];

      if (
        breakpointWidth >= accWidth &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        breakpointWidth <= breakpoints[viewport]
      ) {
        return [breakpointWidth, breakpointValue];
      }

      return acc;
    },
    [0, defaultValue]
  )[1];

  return value as T;
};

export const useResponsiveProp = <T, B>(
  value: ResponsiveProp<T, B>,
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
