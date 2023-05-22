import { createContext } from "@salt-ds/core";
export interface A11yValueProps {
  /**
   * id for FormFieldHelperText
   */
  helperTextId?: string;
  /**
   * id for FormFieldLabel
   */
  labelId?: string;
}
export interface FormFieldContextNextValue {
  a11yProps: A11yValueProps;
  disabled: boolean;
  readOnly: boolean;
  validationStatus: "error" | "warning" | "success" | undefined;
}

export const FormFieldContextNext = createContext(
  "FormFieldContext",
  {} as FormFieldContextNextValue
);
