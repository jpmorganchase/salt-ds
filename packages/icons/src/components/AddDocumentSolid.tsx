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
      <path
        fillRule="evenodd"
        d="M1 12V0h8l2 2v10H1Zm4-7h1v2h2v1H6v2H5V8H3V7h2V5Zm3-4H7v3h3V3H8V1Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
