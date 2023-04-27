import { clsx } from "clsx";
import { Label, makePrefixer, TextProps } from "@salt-ds/core";
import { useFormFieldPropsNext } from "../form-field-context";

import "./FormFieldLabel.css";

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
  const { disabled } = useFormFieldPropsNext();

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
