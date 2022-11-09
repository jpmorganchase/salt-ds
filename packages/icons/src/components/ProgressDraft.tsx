import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ProgressDraftIconProps = IconProps;

export const ProgressDraftIcon = forwardRef<
  SVGSVGElement,
  ProgressDraftIconProps
>(function ProgressDraftIcon(props: ProgressDraftIconProps, ref) {
  return (
    <Icon
      data-testid="ProgressDraftIcon"
      aria-label="progress draft"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M6 11A5 5 0 1 0 6 1a5 5 0 0 0 0 10Zm0 1A6 6 0 1 0 6 0a6 6 0 0 0 0 12Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
