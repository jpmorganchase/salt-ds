// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type ThumbsUpSolidIconProps = IconProps;

export const ThumbsUpSolidIcon = forwardRef<
  SVGSVGElement,
  ThumbsUpSolidIconProps
>(function ThumbsUpSolidIcon(props: ThumbsUpSolidIconProps, ref) {
  return (
    <Icon
      data-testid="ThumbsUpSolidIcon"
      aria-label="thumbs up solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M2 12V5H0v7z" />
      <path
        fillRule="evenodd"
        d="M4 0h1.5A1.5 1.5 0 0 1 7 1.5V4h3.5A1.5 1.5 0 0 1 12 5.5V8l-2 4H3V5l1-2z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
