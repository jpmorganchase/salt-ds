import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type StepSuccessIconProps = IconProps;

export const StepSuccessIcon = forwardRef<SVGSVGElement, StepSuccessIconProps>(
  function StepSuccessIcon(props: StepSuccessIconProps, ref) {
    return (
      <Icon
        data-testid="StepSuccessIcon"
        aria-label="step success"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M6 12A6 6 0 1 1 6 0a6 6 0 0 1 0 12zM4.873 9.476l5.033-5.549-1.1-1.02-4.009 4.444-1.843-1.712L1.93 6.735l2.943 2.741z" />
      </Icon>
    );
  }
);
