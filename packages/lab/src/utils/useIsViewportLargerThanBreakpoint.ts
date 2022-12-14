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
  const allPreviousBreakpoints = orderedBreakpoints.slice(0, index + 1);

  const currentBreakpoint = useCurrentBreakpoint();

  const view = allPreviousBreakpoints.includes(currentBreakpoint);

  return view;
};
