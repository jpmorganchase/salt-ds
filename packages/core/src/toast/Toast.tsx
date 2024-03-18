import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { StatusIndicator, ValidationStatus } from "../status-indicator";
import { makePrefixer } from "../utils";

import toastCss from "./Toast.css";
import { IconProps } from "@salt-ds/icons";

const withBaseName = makePrefixer("saltToast");

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

export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  props,
  ref
) {
  const { children, className, status, Icon, ...rest } = props;
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
        className
      )}
      role="alert"
      {...rest}
      ref={ref}
    >
      {status && (
        <div
          className={withBaseName("iconContainer")}
          {...(Icon && { "aria-hidden": true })}
        >
          {Icon ? <Icon /> : <StatusIndicator status={status} />}
        </div>
      )}
      {children}
    </div>
  );
});
