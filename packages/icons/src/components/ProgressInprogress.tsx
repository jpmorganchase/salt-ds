import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ProgressInprogressIconProps = IconProps;

export const ProgressInprogressIcon = forwardRef<
  SVGSVGElement,
  ProgressInprogressIconProps
>(function ProgressInprogressIcon(props: ProgressInprogressIconProps, ref) {
  return (
    <Icon
      data-testid="ProgressInprogressIcon"
      aria-label="progress inprogress"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 6A6 6 0 1 1 0 6a6 6 0 0 1 12 0ZM1 6a5 5 0 0 1 5-5v10a5 5 0 0 1-5-5Z"
      />
    </Icon>
  );
});
