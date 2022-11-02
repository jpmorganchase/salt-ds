import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type MicroMenuIconProps = IconProps;

export const MicroMenuIcon = forwardRef<SVGSVGElement, MicroMenuIconProps>(
  function MicroMenuIcon(props: MicroMenuIconProps, ref) {
    return (
      <Icon
        data-testid="MicroMenuIcon"
        aria-label="micro menu"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M5 11V9h2v2H5z" />
          <path d="M5 7V5h2v2H5z" />
          <path d="M5 1v2h2V1H5z" />
        </>
      </Icon>
    );
  }
);
