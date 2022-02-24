import { createContext } from "react";
import { CheckboxGroupProps } from "../CheckboxGroup";

interface CheckboxGroupState {
  name: CheckboxGroupProps["name"];
  onChange: CheckboxGroupProps["onChange"];
  checkedValues: CheckboxGroupProps["checkedValues"];
}

const CheckboxGroupContext = createContext<CheckboxGroupState | null>(null);

if (process.env.NODE_ENV !== "production") {
  CheckboxGroupContext.displayName = "CheckboxGroupContext";
}

export { CheckboxGroupContext };
