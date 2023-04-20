import clsx from "clsx";
import { Label, LabelProps, makePrefixer } from "@salt-ds/core";
import { FormFieldProps } from "./FormFieldNext";

import "./FormFieldHelperText.css";

const withBaseName = makePrefixer("saltFormFieldHelperText");

export interface FormFieldHelperTextProps
  extends Omit<LabelProps, "variant" | "styleAs"> {
  helperText: FormFieldProps["helperText"];
  disabled?: boolean;
}

export const FormFieldHelperText = ({
  className,
  disabled,
  helperText,
  ...restProps
}: FormFieldHelperTextProps) => {
  return (
    <Label
      className={clsx(withBaseName(), className)}
      disabled={disabled}
      variant="secondary"
      {...restProps}
    >
      {helperText}
    </Label>
  );
};
