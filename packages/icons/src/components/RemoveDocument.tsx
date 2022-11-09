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
      <path d="M8 7H3v1h5V7z" />
      <path d="M8.707 0 11 2.293V12H1V0h7.707zM2 1v10h8V4H7V1H2zm8 1.707L8.293 1H8v2h2v-.293z" />
    </Icon>
  );
});
