import { Dispatch, FocusEventHandler, RefObject, SetStateAction } from "react";
import { createContext } from "@salt-ds/core";
import { useA11yValueValue } from "../form-field";
import { useA11yValueValue as useA11yValueValueNext } from "../form-field-next";
export interface FormFieldContextValue {
  inFormField: true;
  ref: RefObject<HTMLDivElement>;
  a11yProps: useA11yValueValue | useA11yValueValueNext;
  focused: boolean;
  setFocused: Dispatch<SetStateAction<boolean>>;
  onBlur: FocusEventHandler<HTMLElement>;
  onFocus: FocusEventHandler<HTMLElement>;
}

export const FormFieldContext = createContext(
  "FormFieldContext",
  {} as FormFieldContextValue
);
