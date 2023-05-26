import { ComponentPropsWithoutRef } from "react";
import { FormFieldLegacyProps as FormFieldProps } from "./FormFieldLegacy";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import formHelperTextCss from "./FormHelperText.css";

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
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-form-helper-text",
    css: formHelperTextCss,
    window: targetWindow,
  });

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
