import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { MouseEvent } from "react";

import { useFormFieldProps } from "../form-field-context";
import { Label, type TextProps } from "../text";
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
  onClick,
  ...restProps
}: FormFieldLabelProps) => {
  const { a11yProps, disabled, necessity, formFieldRef } = useFormFieldProps();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-form-field-label",
    css: formFieldLabelCss,
    window: targetWindow,
  });

  const id = a11yProps?.["aria-labelledby"];

  const handleClick = (event: MouseEvent<HTMLLabelElement>) => {
    if (formFieldRef?.current) {
      const element = formFieldRef.current.querySelector<HTMLElement>(
        `[aria-labelledby*="${id}"]`,
      );
      element?.focus();
      element?.click();
    }
    onClick?.(event);
  };

  const necessityLabel = necessity
    ? necessity === "asterisk"
      ? " *"
      : ` (${capitalize(necessity)})`
    : undefined;

  return (
    <Label
      className={clsx(withBaseName(), withBaseName(intent), className)}
      id={id}
      disabled={disabled}
      variant="secondary"
      onClick={handleClick}
      {...restProps}
    >
      {children}
      {necessityLabel && (
        <span className={withBaseName("necessityLabel")}>{necessityLabel}</span>
      )}
    </Label>
  );
};
