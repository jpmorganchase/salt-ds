import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type FolderClosedIconProps = IconProps;

export const FolderClosedIcon = forwardRef<
  SVGSVGElement,
  FolderClosedIconProps
>(function FolderClosedIcon(props: FolderClosedIconProps, ref) {
  return (
    <Icon
      data-testid="FolderClosedIcon"
      aria-label="folder closed"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M12 12V2H6L4 1H0v11h12ZM3.764 2l2 1H11v1H1V2h2.764ZM1 5v6h10V5H1Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
