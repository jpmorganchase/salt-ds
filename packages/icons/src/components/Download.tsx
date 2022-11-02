import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DownloadIconProps = IconProps;

export const DownloadIcon = forwardRef<SVGSVGElement, DownloadIconProps>(
  function DownloadIcon(props: DownloadIconProps, ref) {
    return (
      <Icon
        data-testid="DownloadIcon"
        aria-label="download"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M7 0v5h2L6 9 3 5h2V0h2z" />
          <path d="M12 12v-1H0v1h12z" />
        </>
      </Icon>
    );
  }
);
