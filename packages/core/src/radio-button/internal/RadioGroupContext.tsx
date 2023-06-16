import { ChangeEventHandler } from "react";
import { createContext } from "../../utils";

export interface RadioGroupContextValue {
  name?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLElement>;
  validationStatus?: "error" | "warning";
}

export const RadioGroupContext = createContext<RadioGroupContextValue>(
  "RadioGroupContext",
  {}
);
