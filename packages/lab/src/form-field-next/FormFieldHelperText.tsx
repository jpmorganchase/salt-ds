import clsx from "clsx";
import { HTMLAttributes } from "react";
import { Label, makePrefixer } from "@salt-ds/core";
import { FormFieldProps } from "./FormFieldNext";

import "./FormFieldHelperText.css";

const withBaseName = makePrefixer("saltFormFieldHelperText");

export interface FormFieldHelperTextProps extends HTMLAttributes<HTMLLabelElement> {
  helperText: FormFieldProps["helperText"];
}

export const FormFieldHelperText = <E extends React.ElementType = "p">({
  helperText,
  // state,
  ...restProps
}: FormFieldHelperTextProps) => {
  return (
    <Label className={withBaseName()} {...restProps}>
      {helperText}
    </Label>
  );
};
