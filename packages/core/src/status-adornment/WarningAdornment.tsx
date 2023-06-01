import { forwardRef } from "react";
import { IconProps } from "@salt-ds/icons";

export type WarningAdornmentIconProps = IconProps;

export const WarningAdornmentIcon = forwardRef<
  SVGSVGElement,
  WarningAdornmentIconProps
>(function WarningAdornmentIcon(
  { children, className, ...rest }: WarningAdornmentIconProps,
  ref
) {
  return (
    <svg className={className} {...rest} role="img" viewBox="0 0 9 8" ref={ref}>
      <path d="M0 8L4.5 0L9 8H0Z" />
    </svg>
  );
});
