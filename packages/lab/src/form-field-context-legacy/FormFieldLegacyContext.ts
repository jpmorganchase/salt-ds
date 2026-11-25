import { createContext } from "@salt-ds/core";
import type {
  Dispatch,
  FocusEventHandler,
  RefObject,
  SetStateAction,
} from "react";
import type { useA11yValueValue } from "../form-field-legacy";
/**
 * @deprecated since 1.0.0-alpha.110. Use `FormField` from `@salt-ds/core` instead.
 */
export interface FormFieldLegacyContextValue {
  inFormField: true;
  ref: RefObject<HTMLDivElement | null>;
  a11yProps: useA11yValueValue;
  focused: boolean;
  setFocused: Dispatch<SetStateAction<boolean>>;
  onBlur: FocusEventHandler<HTMLElement>;
  onFocus: FocusEventHandler<HTMLElement>;
}

/**
 * @deprecated since 1.0.0-alpha.110. Use `FormField` from `@salt-ds/core` instead.
 */
export const FormFieldLegacyContext = createContext(
  "FormFieldContext",
  {} as FormFieldLegacyContextValue,
);
