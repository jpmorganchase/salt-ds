import { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { StatusIndicator, ValidationStatus } from "../status-indicator";
import { makePrefixer } from "../utils";

import toastCss from "./Toast.css";

const withBaseName = makePrefixer("saltToast");

export interface ToastProps extends ComponentPropsWithoutRef<"div"> {
  /**
   *  A string to determine the current state of the Toast.
   */
  status?: ValidationStatus;
  /**
   * (Optional) if provided, this icon will be used instead of the status icon
   */
  icon?: React.ForwardRefExoticComponent<
    IconProps & React.RefAttributes<SVGSVGElement>
  >;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  props,
  ref
) {
  const { children, className, status = "info", icon, ...rest } = props;
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
      <StatusIndicator
        status={status}
        className={withBaseName("icon")}
        icon={icon}
      />
      {children}
    </div>
  );
});
