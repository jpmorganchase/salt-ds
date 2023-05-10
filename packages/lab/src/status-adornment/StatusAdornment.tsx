import { clsx } from "clsx";
import { forwardRef } from "react";
import { makePrefixer, ValidationStatus } from "@salt-ds/core";
import { IconProps } from "@salt-ds/icons";
import { ErrorAdornmentIcon } from "./ErrorAdornment";
import { SuccessAdornmentIcon } from "./SuccessAdornment";
import { WarningAdornmentIcon } from "./WarningAdornment";

import statusAdornmentCss from "./StatusAdornment.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

const icons = {
  error: ErrorAdornmentIcon,
  warning: WarningAdornmentIcon,
  success: SuccessAdornmentIcon,
};

type AdornmentValidationStatus = Exclude<ValidationStatus, "info">;

export interface StatusAdornmentProps extends IconProps {
  /**
   * Status adornment to be displayed.
   */
  status: AdornmentValidationStatus;
}

const statusToAriaLabelMap: Record<AdornmentValidationStatus, string> = {
  error: "error",
  warning: "warning",
  success: "success",
};

const withBaseName = makePrefixer("saltStatusAdornment");

export const StatusAdornment = forwardRef<SVGSVGElement, StatusAdornmentProps>(
  function StatusAdornment({ className, status, ...restProps }, ref) {
    const AdornmentComponent = icons[status];
    const ariaLabel = statusToAriaLabelMap[status];

    const { window: targetWindow } = useWindow();
    useComponentCssInjection({
      id: "salt-status-adornment",
      css: statusAdornmentCss,
      window: targetWindow,
    });

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
