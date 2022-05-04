import {
  Breakpoints,
  useViewport,
  useBreakpoints,
} from "@jpmorganchase/uitk-core";
import { getCurrentBreakpoint } from "@jpmorganchase/uitk-lab";

export const useIsStacked = (stackedAtBreakpoint: keyof Breakpoints) => {
  const viewport = useViewport();

  const breakpoints = useBreakpoints();
  const breakpointsKeys = Object.keys(useBreakpoints());

  const index = breakpointsKeys.indexOf(stackedAtBreakpoint);
  const allPreviousBreakpoints = breakpointsKeys.slice(0, index + 1);

  const stackedView = allPreviousBreakpoints.includes(
    getCurrentBreakpoint(breakpoints, viewport)
  );

  return stackedView;
};
