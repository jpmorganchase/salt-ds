import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type FolderOpenSolidIconProps = IconProps;

export const FolderOpenSolidIcon = forwardRef<
  SVGSVGElement,
  FolderOpenSolidIconProps
>(function FolderOpenSolidIcon(props: FolderOpenSolidIconProps, ref) {
  return (
    <Icon
      data-testid="FolderOpenSolidIcon"
      aria-label="folder open solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M4.118 1H0v11h12V2H6.118l-2-1ZM11 3H5.882l-2-1H1v8l3-6h7V3Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
