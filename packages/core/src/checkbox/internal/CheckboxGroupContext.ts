import type { AdornmentValidationStatus } from "../../status-adornment";
import { createContext } from "../../utils";
import type { CheckboxGroupProps } from "../CheckboxGroup";

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
  undefined,
);

export { CheckboxGroupContext };
