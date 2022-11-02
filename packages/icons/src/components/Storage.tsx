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
        <>
          <path d="M8 6H4v1h4V6z" />
          <path d="M0 1h12v3h-1v8H1V4H0V1zm11 1H1v1h10V2zm-1 3H2v6h8V5z" />
        </>
      </Icon>
    );
  }
);
