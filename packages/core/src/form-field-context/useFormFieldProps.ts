import { useContext } from "react";
import {
  FormFieldContext,
  type FormFieldContextValue,
} from "./FormFieldContext";

export function useFormFieldProps(): Partial<FormFieldContextValue> {
  return useContext(FormFieldContext) || {};
}
