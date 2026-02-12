import type { IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef } from "react";
import type { FormFieldValidationStatus } from "../form-field-context";
import { useIcon } from "../semantic-icon-provider";
import type { ValidationStatus } from "../status-indicator";
import { capitalize, makePrefixer } from "../utils";
import statusAdornmentCss from "./StatusAdornment.css";

export type AdornmentValidationStatus = Exclude<ValidationStatus, "info">;

export interface StatusAdornmentProps extends IconProps {
  /**
   * Status adornment to be displayed.
   */
  status: FormFieldValidationStatus;
}

const withBaseName = makePrefixer("saltStatusAdornment");

export const StatusAdornment = forwardRef<SVGSVGElement, StatusAdornmentProps>(
  function StatusAdornment({ className, status, ...restProps }, ref) {
    const icons = useIcon();
    const titleCaseStatus = capitalize(status);
    const iconKey = `${titleCaseStatus}StatusAdornment` as keyof typeof icons;
    const AdornmentComponent = icons[iconKey];

    const ariaLabel = status;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-status-adornment",
      css: statusAdornmentCss,
      window: targetWindow,
    });

    if (AdornmentComponent === undefined) {
      return null;
    }

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
