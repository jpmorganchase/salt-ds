import clsx from "clsx";
import { makePrefixer, StatusIndicator, Text, TextProps } from "@salt-ds/core";
import { FormFieldProps } from "./FormFieldNext";

import "./FormFieldHelperText.css";

const withBaseName = makePrefixer("saltFormFieldHelperText");

export interface FormFieldHelperTextProps
  extends Omit<TextProps<"label">, "variant" | "styleAs"> {
  helperText: FormFieldProps["helperText"];
  disabled?: boolean;
  validationStatus?: "error" | "warning";
}

export const FormFieldHelperText = ({
  className,
  disabled,
  helperText,
  validationStatus,
  ...restProps
}: FormFieldHelperTextProps) => {
  return (
    <div
      className={clsx(
        withBaseName(),
        { [withBaseName("withValidation")]: validationStatus },
        className
      )}
    >
      {validationStatus && <StatusIndicator status={validationStatus} />}
      <Text
        disabled={disabled}
        variant="secondary"
        styleAs="label"
        {...restProps}
      >
        {helperText}
      </Text>
    </div>
  );
};
