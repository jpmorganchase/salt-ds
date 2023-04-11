import { HTMLAttributes } from "react";
import { Label, makePrefixer } from "@salt-ds/core";
import { FormFieldProps } from "./FormFieldNext";

import "./FormHelperText.css";

const withBaseName = makePrefixer("saltFormHelperText");

export interface FormHelperTextProps extends HTMLAttributes<HTMLLabelElement> {
  helperText: FormFieldProps["helperText"];
}

export const FormHelperText = <E extends React.ElementType = "p">({
  helperText,
  ...restProps
}: FormHelperTextProps) => {
  return (
    <Label className={withBaseName()} {...restProps}>
      {helperText}
    </Label>
  );
};
