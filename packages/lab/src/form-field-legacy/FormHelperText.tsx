import { ComponentPropsWithoutRef } from "react";
import { FormFieldLegacyProps } from "./FormFieldLegacy";

import "./FormHelperText.css";

export type FormHelperTextProps<E extends React.ElementType = "p"> =
  ComponentPropsWithoutRef<E> & {
    helperText: FormFieldLegacyProps["helperText"];
    helperTextPlacement: FormFieldLegacyProps["helperTextPlacement"];
  };

export const FormHelperText = <E extends React.ElementType = "p">({
  helperText,
  helperTextPlacement,
  ...restProps
}: FormHelperTextProps<E>) => {
  if (helperText) {
    if (helperTextPlacement === "bottom") {
      return (
        <p className="saltFormHelperText" {...restProps}>
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
