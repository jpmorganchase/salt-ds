// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type PolicyIconProps = IconProps;

export const PolicyIcon = forwardRef<SVGSVGElement, PolicyIconProps>(
  function PolicyIcon(props: PolicyIconProps, ref) {
    return (
      <Icon
        data-testid="PolicyIcon"
        aria-label="policy"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M11 2v2H7V1H2v10h5v1H1V0h8l2 2ZM8 3h2v-.586L8.586 1H8v2Z"
          clipRule="evenodd"
        />
        <path
          fillRule="evenodd"
          d="M9.5 4.5A2.5 2.5 0 0 1 12 7c0 .817-.394 1.54-1 1.996V12l-1.5-.5L8 12V8.996A2.493 2.493 0 0 1 7 7a2.5 2.5 0 0 1 2.5-2.5ZM9 10.612l.184-.06.316-.106.316.106.184.06V9.5H9v1.112ZM9.5 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
          clipRule="evenodd"
        />
        <path d="M6 9H3V8h3v1Zm0-2H3V6h3v1Zm0-2H3V4h3v1Z" />
      </Icon>
    );
  },
);
