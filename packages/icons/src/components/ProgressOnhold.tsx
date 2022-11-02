import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ProgressOnholdIconProps = IconProps;

export const ProgressOnholdIcon = forwardRef<
  SVGSVGElement,
  ProgressOnholdIconProps
>(function ProgressOnholdIcon(props: ProgressOnholdIconProps, ref) {
  return (
    <Icon
      data-testid="ProgressOnholdIcon"
      aria-label="progress onhold"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12Zm-.499-9H4v6h1.501V3ZM8 3H6.499v6H8V3Z"
      />
    </Icon>
  );
});
