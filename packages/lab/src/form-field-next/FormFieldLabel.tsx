import { clsx } from "clsx";
import { Label, makePrefixer, TextProps } from "@salt-ds/core";

import "./FormFieldLabel.css";

const withBaseName = makePrefixer("saltFormFieldLabel");
export interface FormFieldLabelProps
  extends Omit<TextProps<"label">, "variant" | "styleAs"> {
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
    as="label"
    className={clsx(withBaseName(), className)}
    disabled={disabled}
    variant="secondary"
    {...restProps}
  >
    {label}
  </Label>
);
