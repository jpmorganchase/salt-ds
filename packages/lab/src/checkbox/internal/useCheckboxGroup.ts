import { useContext } from "react";
import { CheckboxGroupContext } from "./CheckboxGroupContext";

export function useCheckboxGroup() {
  return useContext(CheckboxGroupContext);
}
