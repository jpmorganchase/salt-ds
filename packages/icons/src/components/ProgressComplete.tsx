import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ProgressCompleteIconProps = IconProps;

export const ProgressCompleteIcon = forwardRef<
  SVGSVGElement,
  ProgressCompleteIconProps
>(function ProgressCompleteIcon(props: ProgressCompleteIconProps, ref) {
  return (
    <Icon
      data-testid="ProgressCompleteIcon"
      aria-label="progress complete"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12ZM3.207 5.621l-.707.707 2.475 2.475L9.57 4.207 8.864 3.5l-3.89 3.89-1.766-1.77Z"
      />
    </Icon>
  );
});
