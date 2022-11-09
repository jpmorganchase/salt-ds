import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DiamondIconProps = IconProps;

export const DiamondIcon = forwardRef<SVGSVGElement, DiamondIconProps>(
  function DiamondIcon(props: DiamondIconProps, ref) {
    return (
      <Icon
        data-testid="DiamondIcon"
        aria-label="diamond"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M0 4.031 2 0h8l2 4.031L6 11 0 4.062l.03-.03H0Zm6 4.435L8 4.03H4l2 4.435ZM4.944 8.34 1.286 4.03H3l1.944 4.31ZM9 4.03 7.171 8.086l3.503-4.055H9Zm1.382-1.008H8.9l-.4-2.015h.882l1 2.015ZM7.5 1.008l.4 2.015H4.1l.4-2.015h3ZM1.618 3.023H3.1l.4-2.015h-.882l-1 2.015Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
