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
export interface a11yValueAriaProps {
  "aria-labelledby": A11yValueProps["labelId"];
  "aria-describedby": A11yValueProps["helperTextId"] | undefined;
}
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
