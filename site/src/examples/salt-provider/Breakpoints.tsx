import { useBreakpoints, useCurrentBreakpoint } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Breakpoints = (): ReactElement => {
  const breakpoints = useBreakpoints();
  const currentBreakpoint = useCurrentBreakpoint();

  return (
    <div>
      Breakpoints:
      <ul>
        {Object.entries(breakpoints).map(([key, value]) => (
          <li>
            {key} - {value}
          </li>
        ))}
      </ul>
      <br />
      Current breakpoint: {currentBreakpoint}
    </div>
  );
};
