import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type UrgencyHighIconProps = IconProps;

export const UrgencyHighIcon = forwardRef<SVGSVGElement, UrgencyHighIconProps>(
  function UrgencyHighIcon(props: UrgencyHighIconProps, ref) {
    return (
      <Icon
        data-testid="UrgencyHighIcon"
        aria-label="urgency high"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="m6 1 5.3 3.684-.575.816L6 2.215 1.275 5.5.7 4.684 6 1Z" />
          <path d="m6 3.5 5.3 3.684-.575.816L6 4.715 1.275 8 .7 7.184 6 3.5Z" />
          <path d="m6 6 5.3 3.684-.575.816L6 7.215 1.275 10.5.7 9.684 6 6Z" />
        </>
      </Icon>
    );
  }
);
