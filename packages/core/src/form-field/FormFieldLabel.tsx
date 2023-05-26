import { clsx } from "clsx";
import { useFormFieldProps } from "../form-field-context";
import { Label, TextProps } from "../text";
import { makePrefixer } from "../utils";

import "./FormFieldLabel.css";

const withBaseName = makePrefixer("saltFormFieldLabel");

export const FormFieldLabel = ({
  className,
  children,
  ...restProps
}: Omit<TextProps<"label">, "variant" | "styleAs">) => {
  const { a11yProps, disabled } = useFormFieldProps();

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
