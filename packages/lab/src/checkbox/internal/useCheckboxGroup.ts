import { useContext } from "react";
import {CheckboxGroupContext, CheckboxGroupState} from "./CheckboxGroupContext";

export function useCheckboxGroup(): CheckboxGroupState {
  return useContext(CheckboxGroupContext);
}
