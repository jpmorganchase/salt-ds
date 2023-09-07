import { forwardRef } from "react";
import { IconProps } from "@salt-ds/icons";

export type ErrorAdornmentIconProps = IconProps;

export const ErrorAdornmentIcon = forwardRef<
  SVGSVGElement,
  ErrorAdornmentIconProps
>(function ErrorAdornmentIcon(
  { children, className, ...rest }: ErrorAdornmentIconProps,
  ref
) {
  return (
    <svg className={className} {...rest} role="img" ref={ref} viewBox="0 0 8 8">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 8C6.20914 8 8 6.20914 8 4C8 1.79086 6.20914 0 4 0C1.79086 0 0 1.79086 0 4C0 6.20914 1.79086 8 4 8Z"
      />
    </svg>
  );
});
