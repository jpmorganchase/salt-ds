import { Breakpoints } from "../breakpoints";
import {
  useCurrentBreakpoint,
  useOrderedBreakpoints,
} from "./useResponsiveProp";

export const useIsViewportLargerThanBreakpoint = (
  targetedBreakpoint: keyof Breakpoints
): boolean => {
  const orderedBreakpoints = useOrderedBreakpoints();

  const index = orderedBreakpoints.indexOf(targetedBreakpoint);
  const allPreviousBreakpoints = orderedBreakpoints.slice(0, index + 1);

  const currentBreakpoint = useCurrentBreakpoint();

  return allPreviousBreakpoints.includes(currentBreakpoint);
};
