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

import toastCss from "./Toast.css";

const withBaseName = makePrefixer("saltToast");

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /**
   * If `true` the close button will not be displayed.
   */
  hideClose?: boolean;
  /**
   *  A string to determine the current state of the Toast.
   */
  status?: ValidationStatus;
  /**
   * Callback function triggered when the close button is actioned.
   */
  onClose?: () => void;
}

export const Toast = forwardRef(function Toast(
  {
    children,
    hideClose = false,
    onClose,
    status = "info",
    ...restProps
  }: ToastProps,
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
      className={clsx(withBaseName(), withBaseName(status))}
      {...restProps}
      ref={ref}
      role="alert"
    >
      <StatusIndicator status={status} className={withBaseName("icon")} />
      <div className={clsx(withBaseName("content"))}>{children}</div>
      {!hideClose && (
        <div className={clsx(withBaseName("close"))}>
          <Button variant="secondary" onClick={onClose}>
            <CloseIcon />
          </Button>
        </div>
      )}
    </div>
  );
});
