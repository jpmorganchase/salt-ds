import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ImportIconProps = IconProps;

export const ImportIcon = forwardRef<SVGSVGElement, ImportIconProps>(
  function ImportIcon(props: ImportIconProps, ref) {
    return (
      <Icon
        data-testid="ImportIcon"
        aria-label="import"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M11 1H7v1h3v8H7v1h4V1z" />
        <path d="M0 5h5V3l4 3-4 3V7H0V5z" />
      </Icon>
    );
  }
);
