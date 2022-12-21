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
      <path
        fillRule="evenodd"
        d="M1 12V0h8l2 2v10H1ZM7 1h1v2h2v1H7V1Zm1 6H3v1h5V7Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
