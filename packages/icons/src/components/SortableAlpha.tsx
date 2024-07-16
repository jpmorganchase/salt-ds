// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type SortableAlphaIconProps = IconProps;

export const SortableAlphaIcon = forwardRef<
  SVGSVGElement,
  SortableAlphaIconProps
>(function SortableAlphaIcon(props: SortableAlphaIconProps, ref) {
  return (
    <Icon
      data-testid="SortableAlphaIcon"
      aria-label="sortable alpha"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M3.753 5.018 3.264 3.63h-1.91l-.49 1.388H0L1.86 0h.909l1.856 5.018h-.872Zm-.7-2.092-.476-1.367-.078-.25A59.563 59.563 0 0 1 2.31.69a7.033 7.033 0 0 1-.086.315 75.04 75.04 0 0 0-.164.554l-.478 1.367h1.47Z"
        clipRule="evenodd"
      />
      <path d="M4.092 11.997H.5v-.564l2.543-3.736H.579V7h3.445v.56L1.48 11.3h2.611v.697ZM9 7v2.105l1.6-1.597.708.706-2.8 2.795L5.7 8.206l.708-.706L8 9.089V7h1Zm0-1.991V2.904l1.6 1.597.708-.707L8.508 1 5.7 3.802l.708.707L8 2.919v2.09h1Z" />
    </Icon>
  );
});
