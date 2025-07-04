// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type BuildingsSolidIconProps = IconProps;

export const BuildingsSolidIcon = forwardRef<
  SVGSVGElement,
  BuildingsSolidIconProps
>(function BuildingsSolidIcon(props: BuildingsSolidIconProps, ref) {
  return (
    <Icon
      data-testid="BuildingsSolidIcon"
      aria-label="buildings solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M0 1h7v10h1V4h4v8H0zm4 8v2H3V9zM3 3H2v1h1zM2 5h1v1H2zm1 2H2v1h1zm2-4H4v1h1zM4 5h1v1H4zm1 2H4v1h1z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
