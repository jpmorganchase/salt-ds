import { createContext } from "react";
import { CheckboxGroupProps } from "../CheckboxGroup";

export interface CheckboxGroupState {
  name?: CheckboxGroupProps["name"];
  onChange?: CheckboxGroupProps["onChange"];
  checkedValues?: CheckboxGroupProps["checkedValues"];
}

const CheckboxGroupContext = createContext<CheckboxGroupState>({});

if (process.env.NODE_ENV !== "production") {
  CheckboxGroupContext.displayName = "CheckboxGroupContext";
}

export { CheckboxGroupContext };
