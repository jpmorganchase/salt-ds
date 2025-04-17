import { type SyntheticEvent, useContext } from "react";
import type { ButtonAppearance, ButtonSentiment } from "../button";
import { createContext } from "../utils";

export type Value = string | readonly string[] | number | undefined;

export interface ToggleButtonGroupContextValue {
  appearance?: Extract<ButtonAppearance, "bordered" | "solid">;
  disabled?: boolean;
  focus: (id: Value) => void;
  isFocused: (id: Value) => boolean;
  isSelected: (id: Value) => boolean;
  orientation: "horizontal" | "vertical";
  select: (event: SyntheticEvent<HTMLButtonElement>) => void;
  sentiment?: ButtonSentiment;
}

export const ToggleButtonGroupContext = createContext<
  ToggleButtonGroupContextValue | undefined
>("ToggleButtonGroupContext", undefined);

export function useToggleButtonGroup() {
  return useContext(ToggleButtonGroupContext);
}
