import clsx from "clsx";
import { makePrefixer, StatusIndicator, Text, TextProps } from "@salt-ds/core";
import { useFormFieldPropsNext } from "../form-field-context";
import { FormFieldProps } from "./FormFieldNext";

import "./FormFieldHelperText.css";

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
  const { disabled, readOnly, validationStatus } = useFormFieldPropsNext();

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
        variant="secondary"
        styleAs="label"
        {...restProps}
      >
        {helperText}
      </Text>
    </div>
  );
};
