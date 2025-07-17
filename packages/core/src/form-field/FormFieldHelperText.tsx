import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { useFormFieldProps } from "../form-field-context";
import { StatusIndicator } from "../status-indicator";
import { Text, type TextProps } from "../text";
import { makePrefixer } from "../utils";

import formFieldHelperTextCss from "./FormFieldHelperText.css";

const withBaseName = makePrefixer("saltFormFieldHelperText");

export interface FormFieldHelperTextProps
  extends Omit<TextProps<"label">, "variant" | "styleAs"> {}

export const FormFieldHelperText = ({
  className,
  children,
  ...restProps
}: FormFieldHelperTextProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-form-field-helper-text",
    css: formFieldHelperTextCss,
    window: targetWindow,
  });

  const { a11yProps, disabled, readOnly, validationStatus } =
    useFormFieldProps();

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
        id={a11yProps?.["aria-describedby"]}
        styleAs="label"
        color={validationStatus ?? "secondary"}
        {...restProps}
      >
        {children}
      </Text>
    </div>
  );
};
