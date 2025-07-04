// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type DocumentSearchIconProps = IconProps;

export const DocumentSearchIcon = forwardRef<
  SVGSVGElement,
  DocumentSearchIconProps
>(function DocumentSearchIcon(props: DocumentSearchIconProps, ref) {
  return (
    <Icon
      data-testid="DocumentSearchIcon"
      aria-label="document search"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M11 2v3.5h-1V4H7V1H2v10h5v1H1V0h8zM8 3h2v-.586L8.586 1H8z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M8 5.5a2.5 2.5 0 0 1 2.085 3.878l1.768 1.768-.707.707-1.768-1.768A2.5 2.5 0 1 1 8 5.5m0 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
        clipRule="evenodd"
      />
      <path d="M5 9H3V8h2zm0-2H3V6h2zm1-2H3V4h3z" />
    </Icon>
  );
});
