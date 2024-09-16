import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ReactElement,
  forwardRef,
  useEffect,
  useState,
} from "react";
import { StatusIndicator, type ValidationStatus } from "../status-indicator";
import { makePrefixer } from "../utils";

import type { IconProps } from "@salt-ds/icons";
import toastCss from "./Toast.css";

const withBaseName = makePrefixer("saltToast");

export interface ToastProps extends ComponentPropsWithoutRef<"div"> {
  /**
   *  A string to determine the current state of the Toast.
   */
  status?: ValidationStatus;
  /**
   * (Optional) if provided, this icon component will be used instead of the status icon
   */
  icon?: ReactElement<IconProps>;
  /**
   * Time in milliseconds to auto-hide the toast. Default is 5000ms (5 seconds)
   */
  autoHideDuration?: number;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  function Toast(props, ref) {
    const { children, className, status, icon, autoHideDuration, ...rest } = props;
    const targetWindow = useWindow();
    const [isVisible, setIsVisible] = useState(true);

    useComponentCssInjection({
      testId: "salt-toast",
      css: toastCss,
      window: targetWindow,
    });

    useEffect(() => {
      if (autoHideDuration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, autoHideDuration);

        return () => clearTimeout(timer);
      }
    }, [autoHideDuration]);

    if (!isVisible) {
      return null;
    }

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
