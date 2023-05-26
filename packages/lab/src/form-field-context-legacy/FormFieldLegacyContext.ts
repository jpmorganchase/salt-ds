import { Dispatch, FocusEventHandler, RefObject, SetStateAction } from "react";
import { createContext } from "@salt-ds/core";
import { useA11yValueValue } from "../form-field-legacy";
export interface FormFieldLegacyContextValue {
  inFormField: true;
  ref: RefObject<HTMLDivElement>;
  a11yProps: useA11yValueValue;
  focused: boolean;
  setFocused: Dispatch<SetStateAction<boolean>>;
  onBlur: FocusEventHandler<HTMLElement>;
  onFocus: FocusEventHandler<HTMLElement>;
}

export const FormFieldLegacyContext = createContext(
  "FormFieldContext",
  {} as FormFieldLegacyContextValue
);
