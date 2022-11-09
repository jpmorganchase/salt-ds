import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ChevronRightIconProps = IconProps;

export const ChevronRightIcon = forwardRef<
  SVGSVGElement,
  ChevronRightIconProps
>(function ChevronRightIcon(props: ChevronRightIconProps, ref) {
  return (
    <Icon
      data-testid="ChevronRightIcon"
      aria-label="chevron right"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M7.308 6 2.5 1.599 3.492.5 9.5 6l-6.008 5.5-.992-1.099L7.308 6z" />
    </Icon>
  );
});
