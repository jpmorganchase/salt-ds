import clsx from "clsx";
import { HTMLAttributes } from "react";
import { Label, makePrefixer } from "@salt-ds/core";
import { FormFieldProps } from "./FormFieldNext";

import "./FormFieldHelperText.css";

const withBaseName = makePrefixer("saltFormFieldHelperText");

export interface FormFieldHelperTextProps extends HTMLAttributes<HTMLLabelElement> {
  helperText: FormFieldProps["helperText"];
  disabled?: boolean;
}

export const FormFieldHelperText = <E extends React.ElementType = "p">({
  className,
  disabled,
  helperText,
  ...restProps
}: FormFieldHelperTextProps) => {
  return (
    <Label 
    className={clsx(withBaseName(), className, {
      [withBaseName("disabled")]: disabled
    })} {...restProps}>
      {helperText}
    </Label>
  );
};
