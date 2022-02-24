import { SVGAttributes } from "react";
import { FormFieldProps } from "./FormField";
import { classBase } from "./constant";

import "./ActivationIndicator.css";

const ErrorIndicatorIcon = (props: SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      viewBox="0 0 16 16"
      focusable={false}
      data-testid="ErrorIndicatorIcon"
      width="16"
      height="16"
      {...props}
    >
      <circle cx={8} cy={8} r={8} />
    </svg>
  );
};

const WarningIndicatorIcon = (props: SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      viewBox="0 0 16 16"
      focusable={false}
      data-testid="WarningIndicatorIcon"
      width="16"
      height="16"
      {...props}
    >
      <polygon points="0,16 16,16 16,0" />
    </svg>
  );
};

const ActivationIndicatorIcon = ({
  validationState,
  ...restSvgProps
}: Pick<FormFieldProps, "validationState"> & SVGAttributes<SVGSVGElement>) => {
  if (validationState === "error") {
    return <ErrorIndicatorIcon {...restSvgProps} />;
  } else if (validationState === "warning") {
    return <WarningIndicatorIcon {...restSvgProps} />;
  } else {
    return null;
  }
};

// Removed `enabled` prop, it's better to let parent to control render
export interface ActivationIndicatorProps
  extends Pick<FormFieldProps, "validationState"> {
  hasIcon?: boolean;
}

export const ActivationIndicator = ({
  hasIcon,
  validationState,
}: ActivationIndicatorProps) => {
  return (
    <>
      <div className={`${classBase}-activationIndicator`}>
        {hasIcon && validationState && (
          <ActivationIndicatorIcon
            validationState={validationState}
            className={`${classBase}-activationIndicatorIcon`}
          />
        )}
      </div>
    </>
  );
};
