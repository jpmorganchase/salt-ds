import { createContext } from "@salt-ds/core";
import { SyntheticEvent, useContext } from "react";

export interface ToggleButtonGroupContextValue {
  disabled?: boolean;
  select: (event: SyntheticEvent<HTMLButtonElement>) => void;
  isSelected: (
    id: string | ReadonlyArray<string> | number | undefined
  ) => boolean;
  focus: (id: string | ReadonlyArray<string> | number | undefined) => void;
  isFocused: (
    id: string | ReadonlyArray<string> | number | undefined
  ) => boolean;
}

export const ToggleButtonGroupContext = createContext<
  ToggleButtonGroupContextValue | undefined
>("ToggleButtonGroupContext", undefined);

export function useToggleButtonGroup() {
  return useContext(ToggleButtonGroupContext);
}
