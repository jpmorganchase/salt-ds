import { type ReactNode, useContext, useState } from "react";
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

  return (
    <Context.Provider value={{ matchedBreakpoints }}>
      {children}
    </Context.Provider>
  );
}

export function useMatchedBreakpoints(breakpoints: Breakpoints): Breakpoint[] {
  const entries = Object.entries(breakpoints).sort(([, a], [, b]) => b - a);
  const queries = entries.map(([, value]) => `(min-width: ${value}px)`);

  const supportsMatchMedia =
    typeof window !== "undefined" && typeof window.matchMedia === "function";

  const [matchedBreakpoints, setMatchedBreakpoints] = useState<
    Partial<Record<Breakpoint, boolean>>
  >(Object.fromEntries(entries.map(([bp]) => [bp as Breakpoint, false])));

  useIsomorphicLayoutEffect(() => {
    if (!supportsMatchMedia) {
      return;
    }

    const matchers = queries.map((query, index) => {
      const mq = window.matchMedia(query);
      const bp = entries[index][0] as Breakpoint;

      return {
        mq,
        handler: () => {
          setMatchedBreakpoints((prev) => {
            return {
              ...prev,
              [bp]: mq.matches,
            };
          });
        },
      };
    });

    matchers.forEach(({ mq, handler }) => {
      handler();
      mq.addEventListener("change", handler);
    });

    return () => {
      matchers.forEach(({ mq, handler }) => {
        mq.removeEventListener("change", handler);
      });
    };
  }, [supportsMatchMedia]);

  return Object.keys(matchedBreakpoints).filter(
    (bp) => matchedBreakpoints[bp as Breakpoint],
  ) as Breakpoint[];
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
