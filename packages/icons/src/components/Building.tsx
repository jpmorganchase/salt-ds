import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type BuildingIconProps = IconProps;

export const BuildingIcon = forwardRef<SVGSVGElement, BuildingIconProps>(
  function BuildingIcon(props: BuildingIconProps, ref) {
    return (
      <Icon
        data-testid="BuildingIcon"
        aria-label="building"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M0 11h12v1H0v-1Z" />
        <path
          fillRule="evenodd"
          d="M9 1H2v10h7V1ZM1 0v12h9V0H1Z"
          clipRule="evenodd"
        />
        <path
          fillRule="evenodd"
          d="M6 9H5v2h1V9ZM4 8v4h3V8H4Z"
          clipRule="evenodd"
        />
        <path d="M3 4h1v1H3V4Zm0-2h1v1H3V2Zm0 4h1v1H3V6Zm2-2h1v1H5V4Zm0-2h1v1H5V2Zm0 4h1v1H5V6Zm2-2h1v1H7V4Zm0-2h1v1H7V2Zm0 4h1v1H7V6Z" />
      </Icon>
    );
  }
);
