import { ReactNode, useState, useEffect, Context, useMemo } from "react";

import {
  BpType,
  Breakpoint,
  OrderedBreakpoints,
  BreakpointsContextType,
  BreakpointsOrder,
} from "./types";

const getBreakpointsOrder = <BP extends BpType>(
  orderedBreakpoints: OrderedBreakpoints<BP>
): BreakpointsOrder<BP> => {
  const breakpointsOrder = Object.fromEntries(
    orderedBreakpoints.map((breakpoint, order) => [breakpoint, order] as const)
  );

  return breakpointsOrder as BreakpointsOrder<BP>;
};

const getOrderedBreakpoints = <T extends Record<string, number>>(
  breakpoints: T
): (keyof T)[] => {
  return Object.entries(breakpoints)
    .sort(([bpA, bpAValue], [bpB, bpBValue]) => {
      return bpAValue - bpBValue;
    })
    .map(([bp], order) => {
      return bp;
    });
};

type BreakpointsProviderProps = {
  children?: ReactNode;
};

type BreakpointMatchers<BP extends BpType> = Record<
  Breakpoint<BP>,
  MediaQueryList
>;

type GetBreakpointMatchersConfig<BP extends BpType> = {
  orderedBreakpoints: OrderedBreakpoints<BP>;
  breakpoints: BP;
};

// Generated the MediaQueryList matchers which will be used to detect the current breakpoint
const getBreakpointMatchers = <BP extends BpType>({
  orderedBreakpoints,
  breakpoints,
}: GetBreakpointMatchersConfig<BP>): BreakpointMatchers<BP> => {
  const breakpointMatchers = Object.fromEntries(
    orderedBreakpoints.map((breakpoint, i) => {
      let matchPattern: string;

      if (i === 0) {
        matchPattern = `(max-width: ${
          breakpoints[orderedBreakpoints[i + 1]]
        }px)`;
      } else if (i === orderedBreakpoints.length - 1) {
        matchPattern = `(min-width: ${breakpoints[breakpoint]}px)`;
      } else {
        matchPattern = `(min-width: ${
          breakpoints[breakpoint]
        }px) and (max-width: ${breakpoints[orderedBreakpoints[i + 1]]}px)`;
      }

      const match = window.matchMedia(matchPattern);

      return [breakpoint, match] as const;
    })
  );

  return breakpointMatchers as BreakpointMatchers<BP>;
};

type GetCurrentBreakpointConfig<BP extends BpType> = {
  breakpointMatchers: BreakpointMatchers<BP>;
  orderedBreakpoints: OrderedBreakpoints<BP>;
};

const getCurrentBreakpoint = <BP extends BpType>({
  breakpointMatchers,
  orderedBreakpoints,
}: GetCurrentBreakpointConfig<BP>) => {
  const currentBreakpoint = orderedBreakpoints.find((bp) => {
    return breakpointMatchers[bp].matches;
  });

  if (!currentBreakpoint) {
    throw new Error(
      "Current viewport matches none of the specified breakpoints"
    );
  }

  return currentBreakpoint;
};

export const createBreakpointsProvider = <BP extends BpType>(
  breakpoints: BP,
  BreakpointsContext: Context<BreakpointsContextType<BP>>
) => {
  // Generate breakpoint metadata and matchers in outer scope to maintain referential integrity for react hooks
  const orderedBreakpoints = getOrderedBreakpoints(breakpoints);
  const breakpointOrder = getBreakpointsOrder(orderedBreakpoints);
  const breakpointMatchers = getBreakpointMatchers({
    orderedBreakpoints,
    breakpoints,
  });

  const BreakpointsProvider = ({ children }: BreakpointsProviderProps) => {
    const [currentBreakpoint, setCurrentBreakpoint] = useState(() =>
      getCurrentBreakpoint({ breakpointMatchers, orderedBreakpoints })
    );

    // setup the event handlers for detecting breakpoint changes
    useEffect(() => {
      const matchersCleanerupFns: (() => void)[] = [];

      orderedBreakpoints.forEach((breakpoint, i) => {
        const match = breakpointMatchers[breakpoint];

        const handleChange = (e: MediaQueryListEvent) => {
          if (e.matches) {
            setCurrentBreakpoint(breakpoint);
          }
        };

        match.addEventListener("change", handleChange);

        matchersCleanerupFns.push(() => {
          match.removeEventListener("change", handleChange);
        });
      });

      return () => {
        matchersCleanerupFns.forEach((cleanup) => cleanup());
      };
    }, []);

    const value: BreakpointsContextType<BP> = useMemo(
      () => ({
        breakpoints,
        breakpointOrder,
        currentBreakpoint,
        orderedBreakpoints,
      }),
      [currentBreakpoint]
    );

    return (
      <BreakpointsContext.Provider value={value}>
        {children}
      </BreakpointsContext.Provider>
    );
  };

  return BreakpointsProvider;
};
