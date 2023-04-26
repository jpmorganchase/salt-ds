import { createContext } from "@salt-ds/core";
import { useA11yValueValue } from "../form-field-next";

export interface FormFieldContextNextValue {
  a11yProps: useA11yValueValue;
  validationStatus: "error" | "warning" | "success" | undefined;
}

export const FormFieldContextNext = createContext(
  "FormFieldContext",
  {} as FormFieldContextNextValue
);
