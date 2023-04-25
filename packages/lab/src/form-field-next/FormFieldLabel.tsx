import { clsx } from "clsx";
import { Label, makePrefixer, TextProps } from "@salt-ds/core";
import { useFormFieldPropsNext } from "../form-field-context";

import "./FormFieldLabel.css";

const withBaseName = makePrefixer("saltFormFieldLabel");

export const FormFieldLabel = ({
  className,
  children,
  ...restProps
}: Omit<TextProps<"label">, "variant" | "styleAs">) => {
  const { disabled } = useFormFieldPropsNext();

  return (
    <Label
      as="label"
      className={clsx(withBaseName(), className)}
      disabled={disabled}
      variant="secondary"
      {...restProps}
    >
      {children}
    </Label>
  )
};
