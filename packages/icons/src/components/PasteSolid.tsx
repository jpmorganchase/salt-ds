import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PasteSolidIconProps = IconProps;

export const PasteSolidIcon = forwardRef<SVGSVGElement, PasteSolidIconProps>(
  function PasteSolidIcon(props: PasteSolidIconProps, ref) {
    return (
      <Icon
        data-testid="PasteSolidIcon"
        aria-label="paste solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M9 0v1H8v1H4V1H3V0h6z" />
          <path d="M3 1v2h6V1h2v11H1V1h2z" />
        </>
      </Icon>
    );
  }
);
