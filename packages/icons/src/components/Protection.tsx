import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ProtectionIconProps = IconProps;

export const ProtectionIcon = forwardRef<SVGSVGElement, ProtectionIconProps>(
  function ProtectionIcon(props: ProtectionIconProps, ref) {
    return (
      <Icon
        data-testid="ProtectionIcon"
        aria-label="protection"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M6 12C1.188 9.818.5 4.636.5 1.909l.418-.067C2.413 1.604 3.861 1.373 6 0c2.139 1.373 3.587 1.603 5.082 1.842l.418.067C11.5 4.636 10.812 9.818 6 12zm-.5-1.398V1.454c-1.578.845-2.82 1.111-3.977 1.302.136 2.479.93 5.95 3.977 7.845zm4.977-7.845C9.321 2.565 8.078 2.3 6.5 1.455v9.148c3.047-1.895 3.841-5.366 3.977-7.845z" />
      </Icon>
    );
  }
);
