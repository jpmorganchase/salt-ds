// WARNING: This file was generated by a script. Do not modify it manually
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
        <path d="M6.5 9.028h-1V1.914L2.818 4.596l-.707-.707L6 0l3.889 3.89-.707.706L6.5 1.914v7.114ZM12 11v1H0v-1h12Z" />
      </Icon>
    );
  }
);
