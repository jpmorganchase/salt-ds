// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type TypeSolidIconProps = IconProps;

export const TypeSolidIcon = forwardRef<SVGSVGElement, TypeSolidIconProps>(
  function TypeSolidIcon(props: TypeSolidIconProps, ref) {
    return (
      <Icon
        data-testid="TypeSolidIcon"
        aria-label="type solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M3 3v2h2v4h2V5h2V3z" />
        <path
          fillRule="evenodd"
          d="M0 0h3v1h6V0h3v3h-1v6h1v3H9v-1H3v1H0V9h1V3H0zm3 10h6V9h1V3H9V2H3v1H2v6h1z"
          clipRule="evenodd"
        />
      </Icon>
    );
  },
);
