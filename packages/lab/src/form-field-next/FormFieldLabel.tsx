import { clsx } from "clsx";
import { Label, makePrefixer, TextProps } from "@salt-ds/core";

import "./FormFieldLabel.css";
import { useFormFieldPropsNext } from "../form-field-context";

const withBaseName = makePrefixer("saltFormFieldLabel");
export interface FormFieldLabelProps
  extends Omit<TextProps<"label">, "variant" | "styleAs"> {
  /**
   * The label value for the FormFieldLabel
   */
  label?: string;
}

export const FormFieldLabel = ({
  className,
  label,
  ...restProps
}: FormFieldLabelProps) => {
  const { disabled, ...restFormFieldProps } = useFormFieldPropsNext();

  return (
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
};
