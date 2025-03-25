import { forwardRef } from "react";
import { clsx } from "clsx";
import {
  FormFieldHelperText,
  type FormFieldHelperTextProps,
  makePrefixer,
} from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import datePickerHelperText from "./DatePickerHelperText.css";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

const withBaseName = makePrefixer("saltDatePickerHelperText");

export interface DatePickerHelperTextProps extends FormFieldHelperTextProps {}

export const DatePickerHelperText = forwardRef(function DatePickerHelperText(
  { className, ...rest }: DatePickerHelperTextProps,
  ref: React.Ref<HTMLLabelElement>,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-date-picker-helper-text",
    css: datePickerHelperText,
    window: targetWindow,
  });

  const {
    state: { open },
  } = useDatePickerOverlay();

  return (
    <FormFieldHelperText
      ref={ref}
      className={clsx(className, withBaseName(), {
        [withBaseName("open")]: open,
      })}
      {...rest}
    />
  );
});
