import { forwardRef, HTMLAttributes } from "react";
import { makePrefixer } from "@salt-ds/core";
import {
  StatusIndicator,
  ValidationStatus,
} from "@salt-ds/core/src/status-indicator";
import { clsx } from "clsx";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import systemStatusCss from "./SystemStatus.css";

export interface SystemStatusProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Emphasize the styling by applying a background color: defaults to false
   */
  /**
   *  A string to determine the current state of the SystemStatus
   */
  status?: ValidationStatus;
}

const withBaseName = makePrefixer("saltSystemStatus");

export const SystemStatus = forwardRef<HTMLDivElement, SystemStatusProps>(
  function SystemStatus(
    { children, className, status = "info", ...rest },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-system-status",
      css: systemStatusCss,
      window: targetWindow,
    });

    return (
      <div
        className={clsx(withBaseName(), withBaseName(status), className)}
        ref={ref}
        {...rest}
        aria-live="polite"
      >
        <StatusIndicator status={status} className={withBaseName("icon")} />
        {children}
      </div>
    );
  }
);
