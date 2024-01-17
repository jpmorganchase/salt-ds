import { AdornmentValidationStatus } from "../../status-adornment";
import { CheckboxGroupProps } from "../CheckboxGroup";
import { createContext } from "../../utils";

export interface CheckboxGroupState {
  disabled?: boolean;
  name?: CheckboxGroupProps["name"];
  onChange?: CheckboxGroupProps["onChange"];
  checkedValues?: CheckboxGroupProps["checkedValues"];
  readOnly?: boolean;
  validationStatus?: AdornmentValidationStatus;
}

const CheckboxGroupContext = createContext<CheckboxGroupState | undefined>(
  "CheckboxGroupContext",
  undefined
);

export { CheckboxGroupContext };
