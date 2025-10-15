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

    const icons = useIcon();
    const titleCaseStatus = status.charAt(0).toUpperCase() + status.slice(1);
    const iconKey = `${titleCaseStatus}Icon` as keyof typeof icons;
    const IconComponent = icons[iconKey];
    const ariaLabel = status;

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
