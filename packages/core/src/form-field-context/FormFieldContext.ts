import type { RefObject } from "react";
import { createContext } from "../utils";
import { type ValidationStatus, type ValidationStatuses } from "../status-indicator";
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

export type NecessityType = "required" | "optional" | "asterisk";

export interface a11yValueAriaProps {
  "aria-labelledby": A11yValueProps["labelId"];
  "aria-describedby": A11yValueProps["helperTextId"] | undefined;
}

export interface FormFieldValidationStatuses extends Omit<ValidationStatuses, "info"> {};
export type FormFieldValidationStatus = Exclude<ValidationStatus, "info">;
export const FormFieldValidationStatusValues: FormFieldValidationStatus[] = [
  "error",
  "warning",
  "success",
];

export interface FormFieldContextValue {
  a11yProps: a11yValueAriaProps;
  disabled: boolean;
  necessity: NecessityType | undefined;
  readOnly: boolean;
  validationStatus: FormFieldValidationStatus | undefined;
  formFieldRef?: RefObject<HTMLDivElement>;
}

export const FormFieldContext = createContext(
  "FormFieldContext",
  {} as FormFieldContextValue,
);
