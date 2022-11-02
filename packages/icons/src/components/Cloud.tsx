import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CloudIconProps = IconProps;

export const CloudIcon = forwardRef<SVGSVGElement, CloudIconProps>(
  function CloudIcon(props: CloudIconProps, ref) {
    return (
      <Icon
        data-testid="CloudIcon"
        aria-label="cloud"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m3.148 4.949-.474.077A2 2 0 0 0 3 9h6.5a1.5 1.5 0 0 0 .23-2.983l-.658-.1-.161-.646a3.002 3.002 0 0 0-5.527-.74l-.236.418Zm6.733.08a4.002 4.002 0 0 0-7.368-.99A3 3 0 0 0 3 10h6.5a2.5 2.5 0 0 0 .381-4.971Z"
        />
      </Icon>
    );
  }
);
