import { createContext } from "react";
import { ButtonVariant } from "@salt-ds/core";

export type Orientation = "horizontal" | "vertical";

export interface ToggleButtonGroupContextProps {
  disabled?: boolean;
  disableFocus?: boolean;
  disableTooltip?: boolean;
  focusableWhenDisabled?: boolean;
  register: (node: HTMLButtonElement | null, index: number) => void;
  unregister: (index: number) => void;
  orientation?: Orientation;
  variant?: ButtonVariant;
}

export const ToggleButtonGroupContext = createContext<
  ToggleButtonGroupContextProps | undefined
>(undefined);
