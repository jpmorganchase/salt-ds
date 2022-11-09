import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type AddDocumentIconProps = IconProps;

export const AddDocumentIcon = forwardRef<SVGSVGElement, AddDocumentIconProps>(
  function AddDocumentIcon(props: AddDocumentIconProps, ref) {
    return (
      <Icon
        data-testid="AddDocumentIcon"
        aria-label="add document"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M5 5h1v2h2v1H6v2H5V8H3V7h2V5z" />
        <path d="M8.707 0 11 2.293V12H1V0h7.707zM1.5.5V0v.5zM2 1v10h8V4H7V1H2zm8 1.707L8.293 1H8v2h2v-.293z" />
      </Icon>
    );
  }
);
