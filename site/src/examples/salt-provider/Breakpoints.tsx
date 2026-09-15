import {
  StackLayout,
  Text,
  useBreakpoints,
  useCurrentBreakpoint,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const Breakpoints = (): ReactElement => {
  const breakpoints = useBreakpoints();
  const currentBreakpoint = useCurrentBreakpoint();

  return (
    <StackLayout gap={1}>
      <StackLayout gap={0.5}>
        <Text>Breakpoints:</Text>
        <ul>
          {Object.entries(breakpoints).map(([key, value]) => (
            <li key={`${key}-${value}`}>
              {key} - {value}
            </li>
          ))}
        </ul>
      </StackLayout>
      <Text>Current breakpoint: {currentBreakpoint}</Text>
    </StackLayout>
  );
};
