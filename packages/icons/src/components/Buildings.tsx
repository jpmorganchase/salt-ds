import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type BuildingsIconProps = IconProps;

export const BuildingsIcon = forwardRef<SVGSVGElement, BuildingsIconProps>(
  function BuildingsIcon(props: BuildingsIconProps, ref) {
    return (
      <Icon
        data-testid="BuildingsIcon"
        aria-label="buildings"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M0 11h12v1H0v-1Z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 2H1v9h5V2ZM0 1v11h7V1H0Z"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11 5H9v6h2V5ZM8 4v8h4V4H8Z"
          />
          <path d="M2 3h1v1H2V3Z" />
          <path d="M2 5h1v1H2V5Z" />
          <path d="M2 7h1v1H2V7Z" />
          <path d="M4 3h1v1H4V3Z" />
          <path d="M4 5h1v1H4V5Z" />
          <path d="M4 7h1v1H4V7Z" />
          <path d="M3 11V9h1v2H3Z" />
        </>
      </Icon>
    );
  }
);
