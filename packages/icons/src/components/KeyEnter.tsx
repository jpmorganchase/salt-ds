import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type KeyEnterIconProps = IconProps;

export const KeyEnterIcon = forwardRef<SVGSVGElement, KeyEnterIconProps>(
  function KeyEnterIcon(props: KeyEnterIconProps, ref) {
    return (
      <Icon
        data-testid="KeyEnterIcon"
        aria-label="key enter"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M10 3H7V2h4v6H2.914l2.147 2.146-.707.708L1 7.5l3.354-3.354.707.708L2.914 7H10V3Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
