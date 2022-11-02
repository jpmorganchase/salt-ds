import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ProgressPendingIconProps = IconProps;

export const ProgressPendingIcon = forwardRef<
  SVGSVGElement,
  ProgressPendingIconProps
>(function ProgressPendingIcon(props: ProgressPendingIconProps, ref) {
  return (
    <Icon
      data-testid="ProgressPendingIcon"
      aria-label="progress pending"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 6A6 6 0 1 1 0 6a6 6 0 0 1 12 0ZM6 3v3H3v1h4V3H6Z"
      />
    </Icon>
  );
});
