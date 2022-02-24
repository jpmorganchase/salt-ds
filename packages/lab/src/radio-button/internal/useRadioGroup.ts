import { useContext } from "react";
import { RadioGroupContext } from "./RadioGroupContext";

export function useRadioGroup() {
  return useContext(RadioGroupContext);
}
