import {
  type Breakpoints,
  useCurrentBreakpoint,
  useOrderedBreakpoints,
} from "@salt-ds/core";

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useIsViewportLargerThanBreakpoint = (
  targetedBreakpoint: keyof Breakpoints,
): boolean => {
  const orderedBreakpoints = useOrderedBreakpoints();
  const index = orderedBreakpoints.indexOf(targetedBreakpoint);
  const currentBreakpoint = useCurrentBreakpoint();
  const currentBreakpointIndex = orderedBreakpoints.indexOf(currentBreakpoint);
  return index >= currentBreakpointIndex;
};
