import { SyntheticEvent, useContext } from "react";
import { createContext } from "../utils";

export type Value = string | readonly string[] | number | undefined;

export interface ToggleButtonGroupContextValue {
  disabled?: boolean;
  select: (event: SyntheticEvent<HTMLButtonElement>) => void;
  isSelected: (id: Value) => boolean;
  focus: (id: Value) => void;
  isFocused: (id: Value) => boolean;
  orientation: "horizontal" | "vertical";
}

export const ToggleButtonGroupContext = createContext<
  ToggleButtonGroupContextValue | undefined
>("ToggleButtonGroupContext", undefined);

export function useToggleButtonGroup() {
  return useContext(ToggleButtonGroupContext);
}
