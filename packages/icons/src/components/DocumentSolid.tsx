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
      <path d="M9.207 0H1v12h10V1.793L9.207 0zM7 1h1v2h2.25v1H7V1z" />
    </Icon>
  );
});
