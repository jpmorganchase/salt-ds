import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type TargetIconProps = IconProps;

export const TargetIcon = forwardRef<SVGSVGElement, TargetIconProps>(
  function TargetIcon(props: TargetIconProps, ref) {
    return (
      <Icon
        data-testid="TargetIcon"
        aria-label="target"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M5.5 0h1v1.025A5.002 5.002 0 0 1 10.975 5.5H12v1h-1.025A5.002 5.002 0 0 1 6.5 10.975V12h-1v-1.025A5.002 5.002 0 0 1 1.025 6.5H0v-1h1.025A5.002 5.002 0 0 1 5.5 1.025V0ZM2.031 6.5H3v-1h-.97A4.002 4.002 0 0 1 5.5 2.031V3h1v-.97A4.002 4.002 0 0 1 9.969 5.5H9v1h.969A4.002 4.002 0 0 1 6.5 9.969V9h-1v.969A4.002 4.002 0 0 1 2.031 6.5Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
