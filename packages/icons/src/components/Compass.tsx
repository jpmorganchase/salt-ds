import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CompassIconProps = IconProps;

export const CompassIcon = forwardRef<SVGSVGElement, CompassIconProps>(
  function CompassIcon(props: CompassIconProps, ref) {
    return (
      <Icon
        data-testid="CompassIcon"
        aria-label="compass"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M11 6A5 5 0 1 1 1 6a5 5 0 0 1 10 0Zm1 0A6 6 0 1 1 0 6a6 6 0 0 1 12 0ZM4.586 4.586l4.242-1.414-1.414 4.242-4.242 1.414 1.414-4.242Zm.79.79 1.871-.623-.623 1.87-1.871.624.623-1.87Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
