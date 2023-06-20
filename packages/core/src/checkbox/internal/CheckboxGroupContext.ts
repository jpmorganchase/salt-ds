import { createContext } from "react";
import { a11yValueAriaProps } from "../../form-field-context";
import { CheckboxGroupProps } from "../CheckboxGroup";

export interface CheckboxGroupState {
  a11yProps?: a11yValueAriaProps;
  disabled?: boolean;
  name?: CheckboxGroupProps["name"];
  onChange?: CheckboxGroupProps["onChange"];
  checkedValues?: CheckboxGroupProps["checkedValues"];
  readOnly?: boolean;
  validationStatus?: "error" | "warning";
}

const CheckboxGroupContext = createContext<CheckboxGroupState>({});

if (process.env.NODE_ENV !== "production") {
  CheckboxGroupContext.displayName = "CheckboxGroupContext";
}

export { CheckboxGroupContext };
