import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import {
  StatusIndicator,
  ValidationStatus,
  VALIDATION_NAMED_STATUS,
} from "../status-indicator";
import { makePrefixer } from "../utils";
import { useFormFieldProps } from "../form-field-context";

import toastCss from "./Toast.css";

const withBaseName = makePrefixer("saltToast");

export interface ToastProps extends ComponentPropsWithoutRef<"div"> {
  /**
   *  A string to determine the current state of the Toast.
   */
  status?: ValidationStatus;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  props,
  ref
) {
  const { children, className, status: statusProp, ...rest } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toast",
    css: toastCss,
    window: targetWindow,
  });

  const { validationStatus: formFieldValidationStatus } = useFormFieldProps();

  const status =
    formFieldValidationStatus !== undefined &&
    VALIDATION_NAMED_STATUS.includes(formFieldValidationStatus)
      ? formFieldValidationStatus
      : statusProp;

  return (
    <div
      className={clsx(
        withBaseName(),
        { [withBaseName(status ?? "")]: status },
        className
      )}
      role="alert"
      {...rest}
      ref={ref}
    >
      {status && (
        <StatusIndicator status={status} className={withBaseName("icon")} />
      )}
      {children}
    </div>
  );
});
