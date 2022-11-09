import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type BuildingSolidIconProps = IconProps;

export const BuildingSolidIcon = forwardRef<
  SVGSVGElement,
  BuildingSolidIconProps
>(function BuildingSolidIcon(props: BuildingSolidIconProps, ref) {
  return (
    <Icon
      data-testid="BuildingSolidIcon"
      aria-label="building solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M1 11V0h9v11h2v1H0v-1h1Zm3 0h1V9h1v2h1V8H4v3Zm0-9H3v1h1V2Zm0 2H3v1h1V4ZM3 6h1v1H3V6Zm3-2H5v1h1V4ZM5 2h1v1H5V2Zm1 4H5v1h1V6Zm1-2h1v1H7V4Zm1-2H7v1h1V2ZM7 6h1v1H7V6Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
