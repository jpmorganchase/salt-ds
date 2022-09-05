import { ComponentPropsWithoutRef } from "react";
import { FormFieldProps } from "./FormField";

import "./FormFieldHelperText.css";

export type FormFieldHelperTextProps<E extends React.ElementType = "p"> =
  ComponentPropsWithoutRef<E> & {
    helperText: FormFieldProps["helperText"];
    helperTextPlacement: FormFieldProps["helperTextPlacement"];
  };

export const FormFieldHelperText = <E extends React.ElementType = "p">({
  helperText,
  helperTextPlacement,
  ...restProps
}: FormFieldHelperTextProps<E>) => {
  if (helperText) {
    if (helperTextPlacement === "bottom") {
      return (
        <p className={`uitkFormFieldHelperText`} {...restProps}>
          {helperText}
        </p>
      );
    } else if (helperTextPlacement === "tooltip") {
      console.warn("helperTextPlacement tooltip has not yet implemented");
      return null;
    } else {
      return null;
    }
  } else {
    return null;
  }
};
