import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type AddDocumentSolidIconProps = IconProps;

export const AddDocumentSolidIcon = forwardRef<
  SVGSVGElement,
  AddDocumentSolidIconProps
>(function AddDocumentSolidIcon(props: AddDocumentSolidIconProps, ref) {
  return (
    <Icon
      data-testid="AddDocumentSolidIcon"
      aria-label="add document solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M9.207 0 11 1.793V12H1V0h8.207zM8 1H7v3h3.25V3H8V1zM6 5H5v2H3v1h2v2h1V8h2V7H6V5z" />
    </Icon>
  );
});
