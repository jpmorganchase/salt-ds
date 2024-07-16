// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type ChevronLeftIconProps = IconProps;

export const ChevronLeftIcon = forwardRef<SVGSVGElement, ChevronLeftIconProps>(
  function ChevronLeftIcon(props: ChevronLeftIconProps, ref) {
    return (
      <Icon
        data-testid="ChevronLeftIcon"
        aria-label="chevron left"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M4.692 6 9.5 10.401 8.508 11.5 2.5 6 8.508.5 9.5 1.599 4.692 6Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  },
);
