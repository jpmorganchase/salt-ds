import { clsx } from "clsx";
import { Label, makePrefixer, TextProps } from "@salt-ds/core";
import { useFormFieldPropsNext } from "../form-field-context-next";

import "./FormFieldLabel.css";

const withBaseName = makePrefixer("saltFormFieldLabel");

export const FormFieldLabel = ({
  className,
  children,
  ...restProps
}: Omit<TextProps<"label">, "variant" | "styleAs">) => {
  const { a11yProps, disabled } = useFormFieldPropsNext();

  return (
    <Label
      as="label"
      className={clsx(withBaseName(), className)}
      id={a11yProps?.["aria-labelledby"]}
      disabled={disabled}
      variant="secondary"
      {...restProps}
    >
      {children}
    </Label>
  );
};
