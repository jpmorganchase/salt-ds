import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ExportIconProps = IconProps;

export const ExportIcon = forwardRef<SVGSVGElement, ExportIconProps>(
  function ExportIcon(props: ExportIconProps, ref) {
    return (
      <Icon
        data-testid="ExportIcon"
        aria-label="export"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M5 1H1v10h4v-1H2V2h3V1Z" />
        <path d="M3 5h5V3l4 3-4 3V7H3V5Z" />
      </Icon>
    );
  }
);
