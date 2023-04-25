import { clsx } from "clsx";
import { forwardRef } from "react";
import { makePrefixer, ValidationStatus } from "@salt-ds/core";
import { IconProps } from "@salt-ds/icons";
import { ErrorAdornmentIcon } from "./ErrorAdornment";
import { WarningAdornmentIcon } from "./WarningAdornment";

import "./StatusAdornment.css";

const icons = {
  error: ErrorAdornmentIcon,
  warning: WarningAdornmentIcon,
};

type AdornmentValidationStatus = Exclude<ValidationStatus, "success" | "info">;

export interface StatusAdornmentProps extends IconProps {
  /**
   * Status adornment to be displayed.
   */
  status: AdornmentValidationStatus;
}

const statusToAriaLabelMap: Record<AdornmentValidationStatus, string> = {
  error: "error",
  warning: "warning",
};

const withBaseName = makePrefixer("saltStatusAdornment");

export const StatusAdornment = forwardRef<SVGSVGElement, StatusAdornmentProps>(
  function StatusAdornment({ className, status, ...restProps }, ref) {
    const AdornmentComponent = icons[status];
    const ariaLabel = statusToAriaLabelMap[status];

    return (
      <AdornmentComponent
        className={clsx(withBaseName(), withBaseName(status), className)}
        aria-label={ariaLabel}
        {...restProps}
        ref={ref}
      />
    );
  }
);
