import { ChangeEventHandler } from "react";
import { a11yValueAriaProps } from "../../form-field-context";
import { createContext } from "../../utils";

export interface RadioGroupContextValue {
  a11yProps?: a11yValueAriaProps;
  disabled?: boolean;
  name?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLElement>;
  validationStatus?: "error" | "warning";
}

export const RadioGroupContext = createContext<RadioGroupContextValue>(
  "RadioGroupContext",
  {}
);
