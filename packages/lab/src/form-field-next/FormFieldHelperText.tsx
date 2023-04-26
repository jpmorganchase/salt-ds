import clsx from "clsx";
import { makePrefixer, StatusIndicator, Text, TextProps } from "@salt-ds/core";
import { FormFieldProps } from "./FormFieldNext";

import "./FormFieldHelperText.css";
import { useFormFieldPropsNext } from "../form-field-context";

const withBaseName = makePrefixer("saltFormFieldHelperText");

export interface FormFieldHelperTextProps
  extends Omit<TextProps<"label">, "variant" | "styleAs"> {
  helperText: FormFieldProps["helperText"];
}

export const FormFieldHelperText = ({
  className,
  helperText,
  ...restProps
}: FormFieldHelperTextProps) => {
  const {
    a11yProps: { disabled, readOnly, ...restA11y } = {},
    validationStatus,
  } = useFormFieldPropsNext();

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
