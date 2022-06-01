import { Breakpoints } from "@jpmorganchase/uitk-core";
import {
  useCurrentBreakpoint,
  useOrderedBreakpoints,
} from "@jpmorganchase/uitk-core";

export const useIsStacked = (stackedAtBreakpoint: keyof Breakpoints) => {
  const orderedBreakpoints = useOrderedBreakpoints();

  const index = orderedBreakpoints.indexOf(stackedAtBreakpoint);
  const allPreviousBreakpoints = orderedBreakpoints.slice(0, index + 1);

  const currentBreakpoint = useCurrentBreakpoint();

  const stackedView = allPreviousBreakpoints.includes(currentBreakpoint);

  return stackedView;
};
