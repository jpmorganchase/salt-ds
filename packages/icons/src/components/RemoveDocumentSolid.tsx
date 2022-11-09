import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type RemoveDocumentSolidIconProps = IconProps;

export const RemoveDocumentSolidIcon = forwardRef<
  SVGSVGElement,
  RemoveDocumentSolidIconProps
>(function RemoveDocumentSolidIcon(props: RemoveDocumentSolidIconProps, ref) {
  return (
    <Icon
      data-testid="RemoveDocumentSolidIcon"
      aria-label="remove document solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M9.207 0H1v12h10V1.793L9.207 0zM8 1v2h2.25v1H7V1h1zm0 6v1H3V7h5z" />
    </Icon>
  );
});
