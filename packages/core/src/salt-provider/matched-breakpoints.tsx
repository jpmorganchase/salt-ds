import { createContext, useIsomorphicLayoutEffect } from "../utils";
import { ReactNode, useContext, useState } from "react";
import { Breakpoints } from "../breakpoints";

type Breakpoint = keyof Breakpoints;

interface MatchedBreakpointContext {
  matchedBreakpoints: Breakpoint[];
}

const Context = createContext<MatchedBreakpointContext>(
  "MatchedBreakpointContext",
  { matchedBreakpoints: [] }
);

interface MatchedBreakpointProviderProps {
  children?: ReactNode;
  matchedBreakpoints: Breakpoint[];
}

export function MatchedBreakpointProvider(
  props: MatchedBreakpointProviderProps
) {
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

  const [matchedBreakpoints, setMatchedBreakpoints] = useState<Breakpoint[]>(
    []
  );

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
          if (mq.matches) {
            setMatchedBreakpoints((prev) => prev.concat([bp]));
          } else {
            setMatchedBreakpoints((prev) =>
              prev.filter((breakpoint) => breakpoint !== bp)
            );
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supportsMatchMedia]);

  return matchedBreakpoints;
}

export function useMatchedBreakpointContext(): MatchedBreakpointContext {
  return useContext(Context);
}
