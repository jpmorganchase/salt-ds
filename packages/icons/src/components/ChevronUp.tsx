import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ChevronUpIconProps = IconProps;

export const ChevronUpIcon = forwardRef<SVGSVGElement, ChevronUpIconProps>(
  function ChevronUpIcon(props: ChevronUpIconProps, ref) {
    return (
      <Icon
        data-testid="ChevronUpIcon"
        aria-label="chevron up"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M6 4.692 1.599 9.5.5 8.508 6 2.5l5.5 6.008-1.099.992L6 4.692z" />
      </Icon>
    );
  }
);
