import { clsx } from "clsx";
import { ForwardedRef, forwardRef, HTMLAttributes, ReactNode } from "react";
import { makePrefixer, StatusIndicator, ValidationStatus } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import toastCss from "./Toast.css";

const withBaseName = makePrefixer("saltToast");

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /**
   *  A string to determine the current state of the Toast.
   */
  status?: ValidationStatus;
}

export const Toast = forwardRef(function Toast(
  { children, status = "info", ...restProps }: ToastProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toast",
    css: toastCss,
    window: targetWindow,
  });

  return (
    <div
      className={clsx(withBaseName(), withBaseName(status), className)}
      {...restProps}
      ref={ref}
      role="alert"
    >
      <StatusIndicator status={status} className={withBaseName("icon")} />
      {children}
    </div>
  );
});
