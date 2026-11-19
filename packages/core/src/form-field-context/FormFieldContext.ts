import type { RefObject } from "react";
import type { ValidationStatuses } from "../status-indicator";
import { createContext } from "../utils";
export interface A11yValueProps {
  /**
   * ID for `FormFieldHelperText`.
   */
  helperTextId?: string;
  /**
   * ID for `FormFieldLabel`.
   */
  labelId?: string;
}

export type NecessityType = "required" | "optional" | "asterisk";

export interface a11yValueAriaProps {
  /**
   * The ID of the `FormFieldLabel` in the surrounding `FormField`. Form controls add it to their `aria-labelledby` attribute.
   */
  "aria-labelledby": A11yValueProps["labelId"];
  /**
   * The ID of the `FormFieldHelperText` in the surrounding `FormField`. Form controls add it to their `aria-describedby` attribute.
   */
  "aria-describedby": A11yValueProps["helperTextId"] | undefined;
}

export interface FormFieldValidationStatuses
  extends Omit<ValidationStatuses, "info"> {}

export type FormFieldValidationStatus = keyof FormFieldValidationStatuses;

export interface FormFieldContextValue {
  a11yProps: a11yValueAriaProps;
  disabled: boolean;
  necessity: NecessityType | undefined;
  readOnly: boolean;
  validationStatus: FormFieldValidationStatus | undefined;
  formFieldRef?: RefObject<HTMLDivElement | null>;
}

export const FormFieldContext = createContext(
  "FormFieldContext",
  {} as FormFieldContextValue,
);
