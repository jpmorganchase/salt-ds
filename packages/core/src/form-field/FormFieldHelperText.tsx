import clsx from "clsx";
import { StatusIndicator } from "../status-indicator";
import { Text, TextProps } from "../text";
import { makePrefixer } from "../utils";
import { useFormFieldProps } from "../form-field-context";

import "./FormFieldHelperText.css";

const withBaseName = makePrefixer("saltFormFieldHelperText");

export const FormFieldHelperText = ({
  className,
  children,
  ...restProps
}: Omit<TextProps<"label">, "variant" | "styleAs">) => {
  const { a11yProps, disabled, readOnly, validationStatus } =
    useFormFieldProps();

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
