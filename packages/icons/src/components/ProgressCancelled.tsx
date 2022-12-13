import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ProgressCancelledIconProps = IconProps;

export const ProgressCancelledIcon = forwardRef<
  SVGSVGElement,
  ProgressCancelledIconProps
>(function ProgressCancelledIcon(props: ProgressCancelledIconProps, ref) {
  return (
    <Icon
      data-testid="ProgressCancelledIcon"
      aria-label="progress cancelled"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12ZM3.828 3.121 5.95 5.243 8.07 3.12l.707.707-2.12 2.123 2.121 2.12-.707.707-2.121-2.12-2.122 2.121-.707-.707L5.243 5.95 3.12 3.828l.707-.707Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
