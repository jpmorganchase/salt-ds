import { useContext } from "react";
import {
  FormFieldContextNext,
  FormFieldContextNextValue,
} from "./FormFieldContextNext";

export function useFormFieldPropsNext(): Partial<FormFieldContextNextValue> {
  return useContext(FormFieldContextNext) || {};
}
