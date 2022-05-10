import { Breakpoints, useBreakpoints } from "@jpmorganchase/uitk-core";
import { useCurrentBreakpoint } from "@jpmorganchase/uitk-lab";

export const useIsStacked = (stackedAtBreakpoint: keyof Breakpoints) => {
  const breakpointsKeys = Object.keys(useBreakpoints());

  const index = breakpointsKeys.indexOf(stackedAtBreakpoint);
  const allPreviousBreakpoints = breakpointsKeys.slice(0, index + 1);

  const currentBreakpoint = useCurrentBreakpoint();

  const stackedView = allPreviousBreakpoints.includes(currentBreakpoint);

  return stackedView;
};
