import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CopySolidIconProps = IconProps;

export const CopySolidIcon = forwardRef<SVGSVGElement, CopySolidIconProps>(
  function CopySolidIcon(props: CopySolidIconProps, ref) {
    return (
      <Icon
        data-testid="CopySolidIcon"
        aria-label="copy solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M8.707 0H4v9h7V2.293L8.707 0zM7 1h1v2h2v1H7V1z" />
        <path d="M8 10H3V3H1v9h7v-2z" />
      </Icon>
    );
  }
);
