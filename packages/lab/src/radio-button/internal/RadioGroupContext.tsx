import { createContext } from "@jpmorganchase/uitk-core";
import { ChangeEventHandler } from "react";

export interface RadioGroupContextValue {
  name?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLElement>;
}

export const RadioGroupContext = createContext(
  "RadioGroupContext",
  {} as RadioGroupContextValue
);
