import { forwardRef } from "react";
import { IconProps } from "@salt-ds/icons";

export type SuccessAdornmentIconProps = IconProps;

export const SuccessAdornmentIcon = forwardRef<
  SVGSVGElement,
  SuccessAdornmentIconProps
>(function SuccessAdornmentIcon(
  { children, className, ...rest }: SuccessAdornmentIconProps,
  ref
) {
  return (
    <svg
      className={className}
      {...rest}
      role="img"
      viewBox="0 0 10 8"
      ref={ref}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.92089 5.95735L8.96399 0L10 1.02133L2.92088 8L0 5.1205L1.03602 4.09918L2.92089 5.95735Z"
      />
    </svg>
  );
});
