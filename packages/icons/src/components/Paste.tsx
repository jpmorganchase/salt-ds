import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PasteIconProps = IconProps;

export const PasteIcon = forwardRef<SVGSVGElement, PasteIconProps>(
  function PasteIcon(props: PasteIconProps, ref) {
    return (
      <Icon
        data-testid="PasteIcon"
        aria-label="paste"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M3 1v1H2v9h8V2H9V1h2v11H1V1h2z" />
        <path d="M9 0v3H3V0h6zM8 1H4v1h4V1z" />
      </Icon>
    );
  }
);
