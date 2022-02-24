import { ChangeEventHandler } from "react";
import { createContext } from "../../utils";

export interface RadioGroupContextValue {
  name?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLElement>;
}

export const RadioGroupContext = createContext(
  "RadioGroupContext",
  {} as RadioGroupContextValue
);
