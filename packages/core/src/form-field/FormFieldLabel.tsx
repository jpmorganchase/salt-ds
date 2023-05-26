import { clsx } from "clsx";
import { useFormFieldProps } from "../form-field-context";
import { Label, TextProps } from "../text";
import { makePrefixer } from "../utils";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import formFieldLabelCss from "./FormFieldLabel.css";

const withBaseName = makePrefixer("saltFormFieldLabel");

export const FormFieldLabel = ({
  className,
  children,
  ...restProps
}: Omit<TextProps<"label">, "variant" | "styleAs">) => {
  const { a11yProps, disabled } = useFormFieldProps();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-form-field-label",
    css: formFieldLabelCss,
    window: targetWindow,
  });

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
