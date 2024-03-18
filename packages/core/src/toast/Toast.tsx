import { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { StatusIndicator, ValidationStatus } from "../status-indicator";
import { makePrefixer } from "../utils";

import toastCss from "./Toast.css";

const withBaseName = makePrefixer("saltToast");
const withIconBaseName = makePrefixer("saltStatusIndicator");

export interface ToastProps extends ComponentPropsWithoutRef<"div"> {
  /**
   *  A string to determine the current state of the Toast.
   */
  status?: ValidationStatus;
  /**
   * (Optional) if provided, this Icon component will be used instead of the status icon
   */
  Icon?: React.ForwardRefExoticComponent<
    IconProps & React.RefAttributes<SVGSVGElement>
  >;
}

const statusToAriaLabelMap: Record<ValidationStatus, string> = {
  error: "error",
  success: "success",
  warning: "warning",
  info: "info",
};

export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  props,
  ref
) {
  const { children, className, status = "info", Icon, ...rest } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-toast",
    css: toastCss,
    window: targetWindow,
  });

  return (
    <div
      className={clsx(withBaseName(), withBaseName(status), className)}
      role="alert"
      {...rest}
      ref={ref}
    >
      {Icon ? (
        <Icon
          className={clsx(
            withIconBaseName(),
            withIconBaseName(status),
            withBaseName("icon")
          )}
          aria-label={statusToAriaLabelMap[status]}
        />
      ) : (
        <StatusIndicator status={status} className={withBaseName("icon")} />
      )}
      {children}
    </div>
  );
});
