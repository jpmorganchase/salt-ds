import type { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactElement,
} from "react";
import { StatusIndicator, type ValidationStatus } from "../status-indicator";
import { makePrefixer } from "../utils";
import toastCss from "./Toast.css";

const withBaseName = makePrefixer("saltToast");

export interface ToastProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The status of the Toast: `"info"`, `"success"`, `"warning"` or `"error"`.
   * It sets the Toast's color and shows the matching status icon.
   */
  status?: ValidationStatus;
  /**
   * The icon shown instead of the status icon. It's only shown when `status` is
   * set.
   */
  icon?: ReactElement<IconProps>;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  function Toast(props, ref) {
    const { children, className, status, icon, ...rest } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-toast",
      css: toastCss,
      window: targetWindow,
    });

    return (
      <div
        className={clsx(
          withBaseName(),
          { [withBaseName(status ?? "")]: status },
          className,
        )}
        role="alert"
        {...rest}
        ref={ref}
      >
        {status && (
          <div className={withBaseName("iconContainer")}>
            {icon ? icon : <StatusIndicator status={status} />}
          </div>
        )}
        {children}
      </div>
    );
  },
);
