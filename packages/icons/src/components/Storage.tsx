import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type StorageIconProps = IconProps;

export const StorageIcon = forwardRef<SVGSVGElement, StorageIconProps>(
  function StorageIcon(props: StorageIconProps, ref) {
    return (
      <Icon
        data-testid="StorageIcon"
        aria-label="storage"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M8 6H4v1h4V6Z" />
        <path
          fillRule="evenodd"
          d="M0 1v3h1v8h10V4h1V1H0Zm11 1H1v1h10V2Zm-1 3H2v6h8V5Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
