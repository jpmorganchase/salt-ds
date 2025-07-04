// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type SuccessIconProps = IconProps;

/** @deprecated - Use `CheckmarkIcon` instead. */
export const SuccessIcon = forwardRef<SVGSVGElement, SuccessIconProps>(
  function SuccessIcon(props: SuccessIconProps, ref) {
    return (
      <Icon
        data-testid="SuccessIcon"
        aria-label="success"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="m3.871 8.033 6.187-6.187 1.06 1.06-7.247 7.248-2.99-2.99 1.06-1.061z"
          clipRule="evenodd"
        />
      </Icon>
    );
  },
);
