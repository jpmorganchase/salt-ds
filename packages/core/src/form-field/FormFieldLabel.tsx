import { clsx } from "clsx";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useFormFieldProps } from "../form-field-context";
import { Label, TextProps } from "../text";
import { capitalize, makePrefixer } from "../utils";

import formFieldLabelCss from "./FormFieldLabel.css";

const withBaseName = makePrefixer("saltFormFieldLabel");

export interface FormFieldLabelProps
  extends Omit<TextProps<"label">, "variant" | "styleAs"> {
  /**
   * Intent for the label.
   *
   * Defaults to "label"
   * Using "sentence" gives more prominent styling
   */
  intent?: "label" | "sentence";
}

export const FormFieldLabel = ({
  className,
  children,
  intent = "label",
  ...restProps
}: FormFieldLabelProps) => {
  const { a11yProps, disabled, necessity } = useFormFieldProps();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-form-field-label",
    css: formFieldLabelCss,
    window: targetWindow,
  });

  const necessityLabel = necessity
    ? necessity === "asterisk"
      ? " *"
      : ` (${capitalize(necessity)})`
    : undefined;

  return (
    <Label
      as="label"
      className={clsx(withBaseName(), withBaseName(intent), className)}
      id={a11yProps?.["aria-labelledby"]}
      disabled={disabled}
      variant="secondary"
      {...restProps}
    >
      {children}
      {necessityLabel && (
        <span className={withBaseName("necessityLabel")}>{necessityLabel}</span>
      )}
    </Label>
  );
};
