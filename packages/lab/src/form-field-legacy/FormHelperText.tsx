import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import type { ComponentPropsWithoutRef } from "react";
import type { FormFieldLegacyProps as FormFieldProps } from "./FormFieldLegacy";

import formHelperTextCss from "./FormHelperText.css";

export interface FormHelperTextProps extends ComponentPropsWithoutRef<"p"> {
  helperText: FormFieldProps["helperText"];
  helperTextPlacement: FormFieldProps["helperTextPlacement"];
}

export const FormHelperText = ({
  helperText,
  helperTextPlacement,
  ...restProps
}: FormHelperTextProps) => {
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
    }
    if (helperTextPlacement === "tooltip") {
      console.warn("helperTextPlacement tooltip has not yet implemented");
      return null;
    }
    return null;
  }
  return null;
};
