import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

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
        clipRule="evenodd"
        d="M0 1h7v10h1V4h4v8H0V1Zm4 8v2H3V9h1ZM3 3H2v1h1V3ZM2 5h1v1H2V5Zm1 2H2v1h1V7Zm2-4H4v1h1V3ZM4 5h1v1H4V5Zm1 2H4v1h1V7Z"
      />
    </Icon>
  );
});
