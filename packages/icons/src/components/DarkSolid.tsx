import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DarkSolidIconProps = IconProps;

export const DarkSolidIcon = forwardRef<SVGSVGElement, DarkSolidIconProps>(
  function DarkSolidIcon(props: DarkSolidIconProps, ref) {
    return (
      <Icon
        data-testid="DarkSolidIcon"
        aria-label="dark solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M11.186 9.02A6 6 0 0 1 5.014.08 6.002 6.002 0 0 0 6 12a5.998 5.998 0 0 0 5.186-2.98Z" />
          <path d="M6.387 2.899H7.45V3.91H6.387V2.9Z" />
          <path d="M9.58.876h1.065v1.011H9.58V.876Z" />
          <path d="M9.58 4.922h1.065v1.011H9.58V4.922Z" />
        </>
      </Icon>
    );
  }
);
