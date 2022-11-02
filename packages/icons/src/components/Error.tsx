import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ErrorIconProps = IconProps;

export const ErrorIcon = forwardRef<SVGSVGElement, ErrorIconProps>(
  function ErrorIcon(props: ErrorIconProps, ref) {
    return (
      <Icon
        data-testid="ErrorIcon"
        aria-label="error"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M5 2h2v5H5V2Z" />
          <path d="M7 8.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3 0h6l3 3v6l-3 3H3L0 9V3l3-3ZM1 3.414 3.414 1h5.172L11 3.414v5.172L8.586 11H3.414L1 8.586V3.414Z"
          />
        </>
      </Icon>
    );
  }
);
