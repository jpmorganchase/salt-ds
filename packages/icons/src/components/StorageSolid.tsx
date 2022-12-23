import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type StorageSolidIconProps = IconProps;

export const StorageSolidIcon = forwardRef<
  SVGSVGElement,
  StorageSolidIconProps
>(function StorageSolidIcon(props: StorageSolidIconProps, ref) {
  return (
    <Icon
      data-testid="StorageSolidIcon"
      aria-label="storage solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M0 1v3h12V1H0Z" />
      <path
        fillRule="evenodd"
        d="M11 5H1v7h10V5ZM4 6h4v1H4V6Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
