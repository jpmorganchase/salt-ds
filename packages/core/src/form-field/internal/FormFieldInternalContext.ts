import { type RefObject, useContext } from "react";
import { useFormFieldProps } from "../../form-field-context";
import { createContext, useIsomorphicLayoutEffect } from "../../utils";

export interface FormFieldInternalContextValue {
  formFieldRef: RefObject<HTMLDivElement | null>;
  labelId?: string;
  helperTextId?: string;
  /**
   * Registers a rendered label. Returns a function that unregisters it.
   */
  registerLabel: () => () => void;
  /**
   * Registers rendered helper text. Returns a function that unregisters it.
   */
  registerHelperText: () => () => void;
}

export const FormFieldInternalContext = createContext<
  FormFieldInternalContextValue | undefined
>("FormFieldInternalContext", undefined);

function useFormFieldElementId(type: "label" | "helperText") {
  const formField = useFormFieldProps();
  const internal = useContext(FormFieldInternalContext);
  // Some components reset or replace FormFieldContext so their content doesn't
  // inherit from the FormField, so only use the FormField that provided it.
  const owner =
    internal && internal.formFieldRef === formField.formFieldRef
      ? internal
      : undefined;

  const register =
    type === "label" ? owner?.registerLabel : owner?.registerHelperText;
  useIsomorphicLayoutEffect(() => register?.(), [register]);

  if (!owner) {
    return type === "label"
      ? formField.a11yProps?.["aria-labelledby"]
      : formField.a11yProps?.["aria-describedby"];
  }
  return type === "label" ? owner.labelId : owner.helperTextId;
}

/**
 * Returns the id for a FormField's label, and registers the label so the
 * FormField's control is labelled by it while it's rendered.
 */
export function useFormFieldLabelId() {
  return useFormFieldElementId("label");
}

/**
 * Returns the id for a FormField's helper text, and registers the helper text
 * so the FormField's control is described by it while it's rendered.
 */
export function useFormFieldHelperTextId() {
  return useFormFieldElementId("helperText");
}
