import { BpType } from "./types";

import { createBreakpointsContext } from "./BreakpointsContext";
import { createBreakpointsProvider } from "./BreakpointsProvider";
import { createUseResponsiveProps } from "./useResponsiveProps";
import { createUseResponsiveValue } from "./useResponsiveValue";
import { createMakeResponsive } from "./makeResponsive";
import { createResponsiveChildren } from "./ResponsiveChildren";

/*
 * We provide a factory for creating the various responsive hooks/components.
 * This allows consumers to create their own breakpoint system with:
 *  - custom names
 *  - custom number of breakpoints
 *  - custom widths for each breakpoint.
 * The types of all the generated system elements will then be typed appropriately to their system
 */
export const createResponsiveSystem = <BP extends BpType>(breakpoints: BP) => {
  const { BreakpointsContext, useBreakpointsContext } =
    createBreakpointsContext<BP>();

  const BreakpointsProvider = createBreakpointsProvider<BP>(
    breakpoints,
    BreakpointsContext
  );

  const useResponsiveProps = createUseResponsiveProps<BP>(
    useBreakpointsContext
  );
  const useResponsiveValue = createUseResponsiveValue<BP>(
    useBreakpointsContext
  );

  const makeResponsive = createMakeResponsive<BP>(useResponsiveProps);

  const ResponsiveChildren = createResponsiveChildren<BP>(useResponsiveValue);

  return {
    ResponsiveChildren,
    BreakpointsProvider,
    useResponsiveProps,
    useResponsiveValue,
    makeResponsive,
  };
};
