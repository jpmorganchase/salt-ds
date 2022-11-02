import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type UploadIconProps = IconProps;

export const UploadIcon = forwardRef<SVGSVGElement, UploadIconProps>(
  function UploadIcon(props: UploadIconProps, ref) {
    return (
      <Icon
        data-testid="UploadIcon"
        aria-label="upload"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M9 4H7v5H5V4H3l3-4 3 4z" />
          <path d="M12 12v-1H0v1h12z" />
        </>
      </Icon>
    );
  }
);
