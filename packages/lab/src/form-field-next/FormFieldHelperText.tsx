import clsx from "clsx";
import { makePrefixer, StatusIndicator, Text, TextProps } from "@salt-ds/core";
import { useFormFieldPropsNext } from "../form-field-context-next";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import formFieldHelperTextCss from "./FormFieldHelperText.css";

const withBaseName = makePrefixer("saltFormFieldHelperText");

export const FormFieldHelperText = ({
  className,
  children,
  ...restProps
}: Omit<TextProps<"label">, "variant" | "styleAs">) => {
  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    testId: "salt-form-field-helper-text",
    css: formFieldHelperTextCss,
    window: targetWindow,
  });

  const { a11yProps, disabled, readOnly, validationStatus } =
    useFormFieldPropsNext();

  return (
    <div
      className={clsx(
        withBaseName(),
        { [withBaseName("withValidation")]: validationStatus },
        className
      )}
    >
      {!disabled && !readOnly && validationStatus && (
        <StatusIndicator status={validationStatus} />
      )}
      <Text
        disabled={disabled}
        id={a11yProps?.["aria-describedby"]}
        variant="secondary"
        styleAs="label"
        {...restProps}
      >
        {children}
      </Text>
    </div>
  );
};
