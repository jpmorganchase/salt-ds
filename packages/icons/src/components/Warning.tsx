import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type WarningIconProps = IconProps;

export const WarningIcon = forwardRef<SVGSVGElement, WarningIconProps>(
  function WarningIcon(props: WarningIconProps, ref) {
    return (
      <Icon
        data-testid="WarningIcon"
        aria-label="warning"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M5 8V4.5h2V8H5Z" />
          <path d="M7 9.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="m6 0 6 12H0L6 0ZM1.618 11 6 2.236 10.382 11H1.618Z"
          />
        </>
      </Icon>
    );
  }
);
