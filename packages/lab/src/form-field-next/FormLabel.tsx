import { clsx } from "clsx";
import { HTMLAttributes } from "react";
import { Label, makePrefixer } from "@salt-ds/core";

import "./FormLabel.css";

const withBaseName = makePrefixer("saltFormLabel");
export interface FormLabelProps extends HTMLAttributes<HTMLLabelElement> {
  /**
   * Whether the form field is disabled.
   */
  disabled?: boolean;
  /**
   * The label value for the FormLabel
   */
  label?: string;
}

export const FormLabel = ({
  label,
  className,
  disabled,
  ...restProps
}: FormLabelProps) => (
  <Label
    className={clsx(withBaseName(), className, {
      [withBaseName("disabled")]: disabled,
    })}
    {...restProps}
  >
    {label}
    {/* <NecessityIndicator
      required={required}
      displayedNecessity={displayedNecessity}
      necessityText={necessityText}
      className={withBaseName("necessityIndicator")}
    /> */}
  </Label>
);
