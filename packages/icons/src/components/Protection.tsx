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
        <path
          fillRule="evenodd"
          d="M6 12C1.188 9.818.5 4.636.5 1.91c.14-.024.28-.046.418-.068C2.413 1.603 3.861 1.372 6 0c2.139 1.373 3.587 1.603 5.082 1.842l.418.067C11.5 4.636 10.812 9.82 6 12Zm-.5-1.398V1.455c-1.578.845-2.82 1.11-3.977 1.302.136 2.48.93 5.95 3.977 7.845Zm4.977-7.845c-.136 2.48-.93 5.95-3.977 7.845V1.455c1.578.845 2.82 1.11 3.977 1.302Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
