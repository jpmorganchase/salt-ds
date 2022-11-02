import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type KeyIconProps = IconProps;

export const KeyIcon = forwardRef<SVGSVGElement, KeyIconProps>(function KeyIcon(
  props: KeyIconProps,
  ref
) {
  return (
    <Icon
      data-testid="KeyIcon"
      aria-label="key"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <>
        <path d="M4.5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.5 6H10V4h2V0H9L4.387 4.613a3.5 3.5 0 1 0 2.378 2.122L7.5 6Zm1.914-5L5.372 5.042l.005.004-.731.731a2.5 2.5 0 1 0 .87.743l.934-.934L7.086 5H9V3h2V1H9.414Z"
        />
      </>
    </Icon>
  );
});
