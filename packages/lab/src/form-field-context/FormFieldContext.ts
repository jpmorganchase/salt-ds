import { Dispatch, FocusEventHandler, RefObject, SetStateAction } from "react";
import { createContext } from "@salt-ds/core";
import { useA11yValueValue } from "../form-field";
import { useA11yValueValue as useA11yValueValueNext } from "../form-field-next";
export interface FormFieldContextValue {
  ref: RefObject<HTMLDivElement>;
  a11yProps: useA11yValueValue | useA11yValueValueNext;

  /* TODO: Legacy FF only; can delete */
  focused?: boolean;
  inFormField?: true;  /** TODO: FormField legacy only */
  setFocused?: Dispatch<SetStateAction<boolean>>;
  onBlur?: FocusEventHandler<HTMLElement>;
  onFocus?: FocusEventHandler<HTMLElement>;
}

export const FormFieldContext = createContext(
  "FormFieldContext",
  {} as FormFieldContextValue
);
