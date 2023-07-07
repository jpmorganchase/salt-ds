import { createContext } from "react";
import { a11yValueAriaProps } from "../../form-field-context";
import { AdornmentValidationStatus } from "../../status-adornment";
import { CheckboxGroupProps } from "../CheckboxGroup";

export interface CheckboxGroupState {
  a11yProps?: a11yValueAriaProps;
  disabled?: boolean;
  name?: CheckboxGroupProps["name"];
  onChange?: CheckboxGroupProps["onChange"];
  checkedValues?: CheckboxGroupProps["checkedValues"];
  validationStatus?: AdornmentValidationStatus;
}

const CheckboxGroupContext = createContext<CheckboxGroupState>({});

if (process.env.NODE_ENV !== "production") {
  CheckboxGroupContext.displayName = "CheckboxGroupContext";
}

export { CheckboxGroupContext };
