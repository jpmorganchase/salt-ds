import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type StepActiveIconProps = IconProps;

export const StepActiveIcon = forwardRef<SVGSVGElement, StepActiveIconProps>(
  function StepActiveIcon(props: StepActiveIconProps, ref) {
    return (
      <Icon
        data-testid="StepActiveIcon"
        aria-label="step active"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12z" />
      </Icon>
    );
  }
);
