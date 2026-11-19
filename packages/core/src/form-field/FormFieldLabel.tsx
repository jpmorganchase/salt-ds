import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type MouseEvent } from "react";

import { useFormFieldProps } from "../form-field-context";
import { Label, type TextProps } from "../text";
import { capitalize, makePrefixer, useIsomorphicLayoutEffect } from "../utils";

import formFieldLabelCss from "./FormFieldLabel.css";

const withBaseName = makePrefixer("saltFormFieldLabel");

export interface FormFieldLabelProps
  extends Omit<TextProps<"label">, "variant" | "styleAs" | "fontWeight"> {
  /**
   * The ID of the label. Inside a `FormField`, the form field's controls are
   * labeled by it. When not set, the form field generates it from its own
   * `id`, as `label-{id}`.
   */
  id?: string;
  /**
   * Intent for the label.
   *
   * Defaults to "label"
   * Using "sentence" gives more prominent styling
   */
  intent?: "label" | "sentence";
}

export const FormFieldLabel = forwardRef<HTMLLabelElement, FormFieldLabelProps>(
  function FormFieldLabel(
    {
      className,
      children,
      id: idProp,
      intent = "label",
      onClick,
      ...restProps
    },
    ref,
  ) {
    const { a11yProps, disabled, necessity, formFieldRef, setLabelId } =
      useFormFieldProps();
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-form-field-label",
      css: formFieldLabelCss,
      window: targetWindow,
    });

    useIsomorphicLayoutEffect(() => {
      if (idProp === undefined || !setLabelId) {
        return;
      }
      setLabelId(idProp);
      return () => setLabelId(undefined);
    }, [idProp, setLabelId]);

    const id = idProp ?? a11yProps?.["aria-labelledby"];

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
        color={intent === "sentence" ? "primary" : "secondary"}
        onClick={handleClick}
        ref={ref}
        {...restProps}
      >
        {children}
        {necessityLabel && (
          <span className={withBaseName("necessityLabel")}>
            {necessityLabel}
          </span>
        )}
      </Label>
    );
  },
);
