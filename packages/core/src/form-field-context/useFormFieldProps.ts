import { useContext } from "react";
import { FormFieldContext, FormFieldContextValue } from "./FormFieldContext";

export function useFormFieldProps(): Partial<FormFieldContextValue> {
  return useContext(FormFieldContext) || {};
}
