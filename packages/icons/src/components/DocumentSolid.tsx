import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DocumentSolidIconProps = IconProps;

export const DocumentSolidIcon = forwardRef<
  SVGSVGElement,
  DocumentSolidIconProps
>(function DocumentSolidIcon(props: DocumentSolidIconProps, ref) {
  return (
    <Icon
      data-testid="DocumentSolidIcon"
      aria-label="document solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M1 0v12h10V2L9 0H1Zm7 1H7v3h3V3H8V1Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
