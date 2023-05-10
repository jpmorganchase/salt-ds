import { clsx } from "clsx";
import { Label, makePrefixer, TextProps } from "@salt-ds/core";
import { useFormFieldPropsNext } from "../form-field-context";

import formFieldLabelCss from "./FormFieldLabel.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

const withBaseName = makePrefixer("saltFormFieldLabel");

export const FormFieldLabel = ({
  className,
  children,
  ...restProps
}: Omit<TextProps<"label">, "variant" | "styleAs">) => {
  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    id: "salt-form-field-label",
    css: formFieldLabelCss,
    window: targetWindow,
  });

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
  );
};
