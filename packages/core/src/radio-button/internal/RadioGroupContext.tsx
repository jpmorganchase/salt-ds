import { ChangeEventHandler } from "react";
import { AdornmentValidationStatus } from "../../status-adornment";
import { createContext } from "../../utils";

export interface RadioGroupContextValue {
  disabled?: boolean;
  name?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLElement>;
  readOnly?: boolean;
  validationStatus?: AdornmentValidationStatus;
}

export const RadioGroupContext = createContext<
  RadioGroupContextValue | undefined
>("RadioGroupContext", undefined);
