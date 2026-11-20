import { type ReactNode, useContext, useMemo, useState } from "react";
import { createContext } from "../utils/createContext";
import { useIsomorphicLayoutEffect } from "../utils/useIsomorphicLayoutEffect";
import type { Breakpoints } from "./Breakpoints";

type Breakpoint = keyof Breakpoints;

interface BreakpointContext {
  matchedBreakpoints: Breakpoint[];
}

const Context = createContext<BreakpointContext>("BreakpointContext", {
  matchedBreakpoints: [],
});

interface BreakpointProviderProps {
  children?: ReactNode;
  matchedBreakpoints: Breakpoint[];
}

export function BreakpointProvider(props: BreakpointProviderProps) {
  const { children, matchedBreakpoints } = props;
  // A stable value, so consumers only re-render when a breakpoint changes.
  const value = useMemo(() => ({ matchedBreakpoints }), [matchedBreakpoints]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useMatchedBreakpoints(breakpoints: Breakpoints): Breakpoint[] {
  const entries = useMemo(
    () => Object.entries(breakpoints).sort(([, a], [, b]) => b - a),
    [breakpoints],
  );

  const supportsMatchMedia =
    typeof window !== "undefined" && typeof window.matchMedia === "function";

  // `min-width: 0px` always matches, so the smallest breakpoint is matched from
  // the first render, including on the server.
  const [matchedBreakpoints, setMatchedBreakpoints] = useState<
    Partial<Record<Breakpoint, boolean>>
  >(() =>
    Object.fromEntries(
      entries.map(([bp, width]) => [bp as Breakpoint, width <= 0]),
    ),
  );

  useIsomorphicLayoutEffect(() => {
    if (!supportsMatchMedia) {
      return;
    }

    const queries = entries.map(([, value]) => `(min-width: ${value}px)`);

    const matchers = queries.map((query, index) => {
      const mq = window.matchMedia(query);
      const bp = entries[index][0] as Breakpoint;

      return {
        mq,
        handler: () => {
          setMatchedBreakpoints((prev) =>
            prev[bp] === mq.matches ? prev : { ...prev, [bp]: mq.matches },
          );
        },
      };
    });

    for (const { mq, handler } of matchers) {
      handler();
      mq.addEventListener("change", handler);
    }

    return () => {
      for (const { mq, handler } of matchers) {
        mq.removeEventListener("change", handler);
      }
    };
  }, [supportsMatchMedia, entries]);

  return useMemo(
    () =>
      Object.keys(matchedBreakpoints).filter(
        (bp) => matchedBreakpoints[bp as Breakpoint],
      ) as Breakpoint[],
    [matchedBreakpoints],
  );
}

export function useBreakpoint(): BreakpointContext & {
  breakpoint: Breakpoint | null;
} {
  const { matchedBreakpoints } = useContext(Context);

  return {
    matchedBreakpoints,
    breakpoint: matchedBreakpoints[0] ?? null,
  };
}
