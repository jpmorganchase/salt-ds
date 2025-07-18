// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type RemoveDocumentIconProps = IconProps;

export const RemoveDocumentIcon = forwardRef<
  SVGSVGElement,
  RemoveDocumentIconProps
>(function RemoveDocumentIcon(props: RemoveDocumentIconProps, ref) {
  return (
    <Icon
      data-testid="RemoveDocumentIcon"
      aria-label="remove document"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M8 7H3v1h5z" />
      <path
        fillRule="evenodd"
        d="M1 0v12h10V2L9 0zm9 4v7H2V1h5v3zm0-1v-.5L8.5 1H8v2z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
