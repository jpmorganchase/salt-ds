import { DEFAULT_ICON_SIZE, type IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef } from "react";
import { useIcon } from "../semantic-icon-provider";
import { makePrefixer } from "../utils";
import statusIndicatorCss from "./StatusIndicator.css";
import type { ValidationStatus } from "./ValidationStatus";

export interface StatusIndicatorProps extends IconProps {
  /**
   * Status indicator to be displayed.
   */
  status: ValidationStatus;
}

const statusToAriaLabelMap: Record<ValidationStatus, string> = {
  error: "error",
  success: "success",
  warning: "warning",
  info: "info",
};

const withBaseName = makePrefixer("saltStatusIndicator");

export const StatusIndicator = forwardRef<SVGSVGElement, StatusIndicatorProps>(
  function StatusIndicator(
    { className, status, size = DEFAULT_ICON_SIZE, ...restProps },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-status-indicator",
      css: statusIndicatorCss,
      window: targetWindow,
    });

    const { ErrorIcon, WarningIcon, SuccessIcon, InfoIcon } = useIcon();

    const iconMap = {
      error: ErrorIcon,
      success: SuccessIcon,
      warning: WarningIcon,
      info: InfoIcon,
    };

    const IconComponent = iconMap[status];
    const ariaLabel = statusToAriaLabelMap[status];

    if (IconComponent === undefined) {
      return null;
    }

    return (
      <IconComponent
        className={clsx(withBaseName(), withBaseName(status), className)}
        size={size}
        aria-label={ariaLabel}
        {...restProps}
        ref={ref}
      />
    );
  },
);
