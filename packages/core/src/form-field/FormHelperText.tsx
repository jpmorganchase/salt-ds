import { ComponentPropsWithoutRef } from "react";
import { FormFieldProps } from "./FormField";

import "./FormHelperText.css";

export type FormHelperTextProps<E extends React.ElementType = "p"> =
  ComponentPropsWithoutRef<E> & {
    helperText: FormFieldProps["helperText"];
    helperTextPlacement: FormFieldProps["helperTextPlacement"];
  };

export const FormHelperText = <E extends React.ElementType = "p">({
  helperText,
  helperTextPlacement,
  ...restProps
}: FormHelperTextProps<E>) => {
  if (!helperText) return null;

  if (helperTextPlacement !== "bottom") return null;

  return (
    <p className={`uitkFormFieldHelperText`} {...restProps}>
      {helperText}
    </p>
  );
};
