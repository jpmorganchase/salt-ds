import {
  DEFAULT_ICON_SIZE,
  ErrorSolidIcon,
  IconProps,
  InfoSolidIcon,
  SuccessTickIcon,
  WarningSolidIcon,
} from "@salt-ds/icons";
import { clsx } from "clsx";
import { forwardRef } from "react";
import { makePrefixer } from "../utils";
import { ValidationStatus } from "./ValidationStatus";

import statusIndicatorCss from "./StatusIndicator.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

const icons = {
  error: ErrorSolidIcon,
  success: SuccessTickIcon,
  warning: WarningSolidIcon,
  info: InfoSolidIcon,
};

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
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-status-indicator",
      css: statusIndicatorCss,
      window: targetWindow,
    });

    const IconComponent = icons[status];
    const ariaLabel = statusToAriaLabelMap[status];

    return (
      <IconComponent
        className={clsx(withBaseName(), withBaseName(status), className)}
        size={size}
        aria-label={ariaLabel}
        {...restProps}
        ref={ref}
      />
    );
  }
);
