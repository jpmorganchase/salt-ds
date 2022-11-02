import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type InboxSolidIconProps = IconProps;

export const InboxSolidIcon = forwardRef<SVGSVGElement, InboxSolidIconProps>(
  function InboxSolidIcon(props: InboxSolidIconProps, ref) {
    return (
      <Icon
        data-testid="InboxSolidIcon"
        aria-label="inbox solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M12 3v9H0V3h1v4h3a2 2 0 1 0 4 0h3V3h1z" />
          <path d="M7 3V0H5v3H3l3 4 3-4H7z" />
        </>
      </Icon>
    );
  }
);
