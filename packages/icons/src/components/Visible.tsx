import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type VisibleIconProps = IconProps;

export const VisibleIcon = forwardRef<SVGSVGElement, VisibleIconProps>(
  function VisibleIcon(props: VisibleIconProps, ref) {
    return (
      <Icon
        data-testid="VisibleIcon"
        aria-label="visible"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M8.25 6a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0zm-1 0a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0z" />
        <path d="M6 10c3 0 5.25-2.75 6-4.125C11.125 4.583 9 2 6 2S.875 4.583 0 5.875C.75 7.25 3 10 6 10zM2.796 7.685A8.781 8.781 0 0 1 1.2 5.919a9.675 9.675 0 0 1 1.625-1.683C3.731 3.516 4.798 3 6 3s2.269.516 3.175 1.236A9.675 9.675 0 0 1 10.8 5.919a8.781 8.781 0 0 1-1.596 1.766C8.28 8.455 7.187 9 6 9s-2.279-.545-3.204-1.315z" />
      </Icon>
    );
  }
);
