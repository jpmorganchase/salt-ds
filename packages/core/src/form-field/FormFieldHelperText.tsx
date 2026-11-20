import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef } from "react";
import { useFormFieldProps } from "../form-field-context";
import { StatusIndicator } from "../status-indicator";
import { Text, type TextProps } from "../text";
import { makePrefixer, useIsomorphicLayoutEffect } from "../utils";

import formFieldHelperTextCss from "./FormFieldHelperText.css";

const withBaseName = makePrefixer("saltFormFieldHelperText");

export interface FormFieldHelperTextProps
  extends Omit<TextProps<"div">, "variant" | "styleAs" | "fontWeight"> {
  /**
   * The ID of the helper text. Inside a `FormField`, the form field's controls
   * are described by it. When not set, the form field generates it from its own
   * `id`, as `helperText-{id}`.
   */
  id?: string;
}

export const FormFieldHelperText = forwardRef<
  HTMLDivElement,
  FormFieldHelperTextProps
>(function FormFieldHelperText(
  { className, children, id: idProp, ...restProps },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-form-field-helper-text",
    css: formFieldHelperTextCss,
    window: targetWindow,
  });

  const { a11yProps, disabled, readOnly, validationStatus, setHelperTextId } =
    useFormFieldProps();

  useIsomorphicLayoutEffect(() => {
    if (idProp === undefined || !setHelperTextId) {
      return;
    }
    setHelperTextId(idProp);
    return () => setHelperTextId(undefined);
  }, [idProp, setHelperTextId]);

  return (
    <div
      className={clsx(
        withBaseName(),
        { [withBaseName("withValidation")]: validationStatus },
        className,
      )}
    >
      {!disabled && !readOnly && validationStatus && (
        <StatusIndicator
          className={withBaseName("statusIndicator")}
          status={validationStatus}
        />
      )}
      <Text
        disabled={disabled}
        id={idProp ?? a11yProps?.["aria-describedby"]}
        styleAs="label"
        color={validationStatus ?? "secondary"}
        ref={ref}
        {...restProps}
      >
        {children}
      </Text>
    </div>
  );
});
