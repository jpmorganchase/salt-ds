import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ProgressRejectedIconProps = IconProps;

export const ProgressRejectedIcon = forwardRef<
  SVGSVGElement,
  ProgressRejectedIconProps
>(function ProgressRejectedIcon(props: ProgressRejectedIconProps, ref) {
  return (
    <Icon
      data-testid="ProgressRejectedIcon"
      aria-label="progress rejected"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12ZM3 6.5h6v-1H3v1Z"
      />
    </Icon>
  );
});
