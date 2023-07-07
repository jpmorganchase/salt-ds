import { clsx } from "clsx";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useFormFieldProps } from "../form-field-context";
import { Label, TextProps } from "../text";
import { capitalize, makePrefixer } from "../utils";

import formFieldLabelCss from "./FormFieldLabel.css";

const withBaseName = makePrefixer("saltFormFieldLabel");

export const FormFieldLabel = ({
  className,
  children,
  question = false,
  ...restProps
}: Omit<TextProps<"label">, "variant" | "styleAs"> & {
  question?: boolean;
}) => {
  const { a11yProps, disabled, necessity } = useFormFieldProps();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-form-field-label",
    css: formFieldLabelCss,
    window: targetWindow,
  });

  const necessityLabel = necessity
    ? necessity === "asterisk"
      ? "*"
      : ` (${capitalize(necessity)})`
    : undefined;

  return (
    <Label
      as="label"
      className={clsx(
        withBaseName(),
        { [withBaseName("question")]: question },
        className
      )}
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
