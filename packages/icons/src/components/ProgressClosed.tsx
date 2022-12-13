import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ProgressClosedIconProps = IconProps;

export const ProgressClosedIcon = forwardRef<
  SVGSVGElement,
  ProgressClosedIconProps
>(function ProgressClosedIcon(props: ProgressClosedIconProps, ref) {
  return (
    <Icon
      data-testid="ProgressClosedIcon"
      aria-label="progress closed"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M4 4h4v4H4V4Z" />
      <path
        fillRule="evenodd"
        d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12ZM3 9V3h6v6H3Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
