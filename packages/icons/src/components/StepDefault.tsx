import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type StepDefaultIconProps = IconProps;

export const StepDefaultIcon = forwardRef<SVGSVGElement, StepDefaultIconProps>(
  function StepDefaultIcon(props: StepDefaultIconProps, ref) {
    return (
      <Icon
        data-testid="StepDefaultIcon"
        aria-label="step default"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M6 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6-4A6 6 0 1 1 0 6a6 6 0 0 1 12 0z" />
      </Icon>
    );
  }
);
