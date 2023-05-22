import { clsx } from "clsx";
import { Label, makePrefixer, TextProps } from "@salt-ds/core";
import { useFormFieldPropsNext } from "../form-field-context-next";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import formFieldLabelCss from "./FormFieldLabel.css";

const withBaseName = makePrefixer("saltFormFieldLabel");

export const FormFieldLabel = ({
  className,
  children,
  ...restProps
}: Omit<TextProps<"label">, "variant" | "styleAs">) => {
  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    testId: "salt-form-field-label",
    css: formFieldLabelCss,
    window: targetWindow,
  });

  const { a11yProps, disabled } = useFormFieldPropsNext();

  return (
    <Label
      as="label"
      {...restProps}
      className={clsx(withBaseName(), className)}
      disabled={disabled}
      variant="secondary"
      id={a11yProps?.labelId}
    >
      {children}
    </Label>
  );
};
