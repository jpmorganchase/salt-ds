import useViewport from "../internal/useViewport";
import { Viewport } from "../types";

export const useIsStacked = (stackedAtBreakpoint: Viewport) => {
  const viewport = useViewport();

  const allBreakpoints = Object.values(Viewport);
  const index = allBreakpoints.indexOf(stackedAtBreakpoint);
  const allPreviousBreakpoints = allBreakpoints.slice(0, index + 1);

  const stackedView = allPreviousBreakpoints.includes(viewport);

  return stackedView;
};
