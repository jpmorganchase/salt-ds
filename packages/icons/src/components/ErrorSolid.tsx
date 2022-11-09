import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ErrorSolidIconProps = IconProps;

export const ErrorSolidIcon = forwardRef<SVGSVGElement, ErrorSolidIconProps>(
  function ErrorSolidIcon(props: ErrorSolidIconProps, ref) {
    return (
      <Icon
        data-testid="ErrorSolidIcon"
        aria-label="error solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M3 0h6l3 3v6l-3 3H3L0 9V3l3-3Zm2 2h2v5H5V2Zm2 6.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
