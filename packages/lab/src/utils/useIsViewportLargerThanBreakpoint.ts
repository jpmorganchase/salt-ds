import {
  Breakpoints,
  useCurrentBreakpoint,
  useOrderedBreakpoints,
} from "@salt-ds/core";

export const useIsViewportLargerThanBreakpoint = (
  targetedBreakpoint: keyof Breakpoints
): boolean => {
  const orderedBreakpoints = useOrderedBreakpoints();
  const index = orderedBreakpoints.indexOf(targetedBreakpoint);
  const currentBreakpoint = useCurrentBreakpoint();
  const currentBreakpointIndex = orderedBreakpoints.indexOf(currentBreakpoint);
  return index >= currentBreakpointIndex;
};
