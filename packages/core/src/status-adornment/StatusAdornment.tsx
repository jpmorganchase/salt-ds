import type { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef } from "react";
import type { ValidationStatus } from "../status-indicator";
import { makePrefixer } from "../utils";
import { ErrorAdornmentIcon } from "./ErrorAdornment";
import statusAdornmentCss from "./StatusAdornment.css";
import { SuccessAdornmentIcon } from "./SuccessAdornment";
import { WarningAdornmentIcon } from "./WarningAdornment";

const icons = {
  error: ErrorAdornmentIcon,
  warning: WarningAdornmentIcon,
  success: SuccessAdornmentIcon,
};

export type AdornmentValidationStatus = Exclude<ValidationStatus, "info">;

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

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-status-adornment",
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
  },
);
