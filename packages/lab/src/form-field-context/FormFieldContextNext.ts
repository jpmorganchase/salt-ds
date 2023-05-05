import { createContext } from "@salt-ds/core";
import { a11yValueAriaProps } from "../form-field-next";

export interface FormFieldContextNextValue {
  a11yProps: a11yValueAriaProps;
  disabled: boolean;
  readOnly: boolean;
  validationStatus: "error" | "warning" | "success" | undefined;
}

export const FormFieldContextNext = createContext(
  "FormFieldContext",
  {} as FormFieldContextNextValue
);
