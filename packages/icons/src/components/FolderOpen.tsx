import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type FolderOpenIconProps = IconProps;

export const FolderOpenIcon = forwardRef<SVGSVGElement, FolderOpenIconProps>(
  function FolderOpenIcon(props: FolderOpenIconProps, ref) {
    return (
      <Icon
        data-testid="FolderOpenIcon"
        aria-label="folder open"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 1h4.118l2 1H12v10H0V1Zm5.882 2H11v1H4L1 9.53V2h2.882l2 1Zm-4.544 8H11V5H4.58l-3.242 6Z"
        />
      </Icon>
    );
  }
);
