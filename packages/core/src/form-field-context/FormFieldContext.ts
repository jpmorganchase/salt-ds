import { createContext } from "../utils";

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

export interface FormFieldContextValue {
  a11yProps: a11yValueAriaProps;
  disabled: boolean;
  readOnly: boolean;
  validationStatus: "error" | "warning" | "success" | undefined;
}

export const FormFieldContext = createContext(
  "FormFieldContext",
  {} as FormFieldContextValue
);
