import { clsx } from "clsx";
import { HTMLAttributes } from "react";
import { Label, makePrefixer } from "@salt-ds/core";

import "./FormFieldLabel.css";

const withBaseName = makePrefixer("saltFormFieldLabel");
export interface FormFieldLabelProps extends HTMLAttributes<HTMLLabelElement> {
  /**
   * Whether the Form Field is disabled.
   */
  disabled?: boolean;
  /**
   * The label value for the FormFieldLabel
   */
  label?: string;
}

export const FormFieldLabel = ({
  className,
  disabled,
  label,
  ...restProps
}: FormFieldLabelProps) => (
  <Label
    className={clsx(withBaseName(), className, {
      [withBaseName("disabled")]: disabled,
    })}
    {...restProps}
  >
    {label}
  </Label>
);
