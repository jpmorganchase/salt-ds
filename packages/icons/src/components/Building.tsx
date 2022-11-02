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
        <>
          <path d="M0 11h12v1H0v-1Z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9 1H2v10h7V1ZM1 0v12h9V0H1Z"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 9H5v2h1V9ZM4 8v4h3V8H4Z"
          />
          <path d="M3 4h1v1H3V4Z" />
          <path d="M3 2h1v1H3V2Z" />
          <path d="M3 6h1v1H3V6Z" />
          <path d="M5 4h1v1H5V4Z" />
          <path d="M5 2h1v1H5V2Z" />
          <path d="M5 6h1v1H5V6Z" />
          <path d="M7 4h1v1H7V4Z" />
          <path d="M7 2h1v1H7V2Z" />
          <path d="M7 6h1v1H7V6Z" />
        </>
      </Icon>
    );
  }
);
