import { ReactElement } from "react";
import { useBreakpoints, useCurrentBreakpoint } from "@salt-ds/core";

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
