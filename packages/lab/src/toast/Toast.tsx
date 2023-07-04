import { clsx } from "clsx";
import { ForwardedRef, forwardRef, HTMLAttributes, ReactNode } from "react";
import {
  Button,
  makePrefixer,
  StatusIndicator,
  ValidationStatus,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { ToastContent } from "./ToastContent";
import toastCss from "./Toast.css";

const withBaseName = makePrefixer("saltToast");

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /**
   *  A string to determine the current state of the Toast
   */
  status?: ValidationStatus;
  onClose?: () => void;
}

export const Toast = forwardRef(function Toast(
  { children, onClose, status = "info", ...restProps }: ToastProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toast",
    css: toastCss,
    window: targetWindow,
  });

  const handleOnClick = () => {
    onClose?.();
  };

  return (
    <div
      className={clsx(withBaseName(), withBaseName(status))}
      {...restProps}
      ref={ref}
    >
      <StatusIndicator status={status} className={withBaseName("icon")} />
      <ToastContent>{children}</ToastContent>
      {onClose && (
        <div className={clsx(withBaseName("close"))}>
          <Button variant="secondary" onClick={handleOnClick}>
            <CloseIcon />
          </Button>
        </div>
      )}
    </div>
  );
});
