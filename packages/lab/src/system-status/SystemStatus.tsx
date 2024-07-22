import {
  StatusIndicator,
  type ValidationStatus,
  makePrefixer,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { type HTMLAttributes, forwardRef } from "react";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import systemStatusCss from "./SystemStatus.css";

export interface SystemStatusProps extends HTMLAttributes<HTMLDivElement> {
  /**
   *  A string to determine the current state of the SystemStatus. Defaults to `info`.
   */
  status?: ValidationStatus;
}

const withBaseName = makePrefixer("saltSystemStatus");

export const SystemStatus = forwardRef<HTMLDivElement, SystemStatusProps>(
  function SystemStatus(
    { children, className, status = "info", ...rest },
    ref,
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
        role="status"
        {...rest}
      >
        <StatusIndicator status={status} className={withBaseName("icon")} />
        {children}
      </div>
    );
  },
);
