import clsx from "clsx";
import { makePrefixer, Text, TextProps } from "@salt-ds/core";
import { FormFieldProps } from "./FormFieldNext";

import "./FormFieldHelperText.css";

const withBaseName = makePrefixer("saltFormFieldHelperText");

export interface FormFieldHelperTextProps
  extends Omit<TextProps<"label">, "variant" | "styleAs"> {
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
    <Text
      className={clsx(withBaseName(), className)}
      disabled={disabled}
      variant="secondary"
      styleAs="label"
      {...restProps}
    >
      {helperText}
    </Text>
  );
};
