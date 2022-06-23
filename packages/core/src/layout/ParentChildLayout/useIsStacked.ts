import {Breakpoints} from "../../breakpoints";
import {useCurrentBreakpoint, useOrderedBreakpoints} from "../../utils";


export const useIsStacked = (stackedAtBreakpoint: keyof Breakpoints) => {
  const orderedBreakpoints = useOrderedBreakpoints();

  const index = orderedBreakpoints.indexOf(stackedAtBreakpoint);
  const allPreviousBreakpoints = orderedBreakpoints.slice(0, index + 1);

  const currentBreakpoint = useCurrentBreakpoint();

  const stackedView = allPreviousBreakpoints.includes(currentBreakpoint);

  return stackedView;
};
