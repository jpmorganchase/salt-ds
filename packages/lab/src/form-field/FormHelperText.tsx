import { ComponentPropsWithoutRef } from "react";
import { FormFieldProps } from "./FormField";

import formHelperTextCss from "./FormHelperText.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

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
  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    id: "salt-helper-text",
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
