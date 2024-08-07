// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type PivotIconProps = IconProps;

export const PivotIcon = forwardRef<SVGSVGElement, PivotIconProps>(
  function PivotIcon(props: PivotIconProps, ref) {
    return (
      <Icon
        data-testid="PivotIcon"
        aria-label="pivot"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M12 0H0v12h12V0ZM1 11V8.5L4 11H1Zm3-2v2h7V1H1v7.5L4 6v2h4V4H6l2.5-3L11 4H9v5H4Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  },
);
