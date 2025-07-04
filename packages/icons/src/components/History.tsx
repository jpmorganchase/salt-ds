// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type HistoryIconProps = IconProps;

export const HistoryIcon = forwardRef<SVGSVGElement, HistoryIconProps>(
  function HistoryIcon(props: HistoryIconProps, ref) {
    return (
      <Icon
        data-testid="HistoryIcon"
        aria-label="history"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M7.293 10.83A5 5 0 1 0 1.668 3.5h2.33v1h-4v-4h1v2.183A6 6 0 0 1 2.256 1.31a6 6 0 1 1 5.296 10.486z" />
        <path d="M6 3v3H3v1h4V3z" />
      </Icon>
    );
  },
);
