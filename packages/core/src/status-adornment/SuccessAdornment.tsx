import type { IconProps } from "@salt-ds/icons";
import { forwardRef } from "react";

export type SuccessAdornmentIconProps = IconProps;

export const SuccessAdornmentIcon = forwardRef<
  SVGSVGElement,
  SuccessAdornmentIconProps
>(function SuccessAdornmentIcon(
  { children, className, ...rest }: SuccessAdornmentIconProps,
  ref,
) {
  return (
    <svg
      className={className}
      {...rest}
      role="img"
      viewBox="0 0 10 8"
      ref={ref}
    >
      {/* Match the shared status tick gesture at the compact adornment weight. */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 4.25718L3.50478 7.76196L10 1.26674L8.9713 0.23804L3.50478 5.70456L1.0287 3.22847Z"
      />
    </svg>
  );
});
