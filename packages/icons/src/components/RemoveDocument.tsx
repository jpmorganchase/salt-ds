import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

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
      <path d="M8 7H3v1h5V7Z" />
      <path
        fillRule="evenodd"
        d="M1 0v12h10V2L9 0H1Zm9 4v7H2V1h5v3h3Zm0-1v-.586L8.586 1H8v2h2Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
