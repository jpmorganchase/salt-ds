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
        <path d="M3 1v1H2v9h8V2H9V1h2v11H1V1h2Z" />
        <path
          fillRule="evenodd"
          d="M9 0H3v3h6V0ZM8 1H4v1h4V1Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
