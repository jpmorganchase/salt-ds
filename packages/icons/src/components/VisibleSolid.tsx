import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type VisibleSolidIconProps = IconProps;

export const VisibleSolidIcon = forwardRef<
  SVGSVGElement,
  VisibleSolidIconProps
>(function VisibleSolidIcon(props: VisibleSolidIconProps, ref) {
  return (
    <Icon
      data-testid="VisibleSolidIcon"
      aria-label="visible solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <>
        <path d="M7.75 6a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0z" />
        <path d="M6 10c3 0 5.25-2.75 6-4.125C11.125 4.583 9 2 6 2S.875 4.583 0 5.875C.75 7.25 3 10 6 10zm2.75-4a2.75 2.75 0 1 1-5.5 0 2.75 2.75 0 0 1 5.5 0z" />
      </>
    </Icon>
  );
});
