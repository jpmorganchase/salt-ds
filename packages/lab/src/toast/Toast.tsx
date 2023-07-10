import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from "react";
import { makePrefixer, StatusIndicator, ValidationStatus } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import toastCss from "./Toast.css";

const withBaseName = makePrefixer("saltToast");

export interface ToastProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
  /**
   *  A string to determine the current state of the Toast.
   */
  status?: ValidationStatus;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  props,
  ref
) {
  const { children, className, status = "info", ...rest } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toast",
    css: toastCss,
    window: targetWindow,
  });

  return (
    <div
      className={clsx(withBaseName(), withBaseName(status), className)}
      {...rest}
      ref={ref}
      role="alert"
    >
      <StatusIndicator status={status} className={withBaseName("icon")} />
      {children}
    </div>
  );
});
