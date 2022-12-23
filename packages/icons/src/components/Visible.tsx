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
        <path
          fillRule="evenodd"
          d="M8.25 6a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-1 0a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z"
          clipRule="evenodd"
        />
        <path
          fillRule="evenodd"
          d="M6 10c3 0 5.25-2.75 6-4.125C11.125 4.583 9 2 6 2S.875 4.583 0 5.875C.75 7.25 3 10 6 10ZM2.796 7.685A8.782 8.782 0 0 1 1.2 5.919a9.64 9.64 0 0 1 1.625-1.683C3.731 3.516 4.8 3 6 3c1.201 0 2.269.516 3.175 1.236A9.666 9.666 0 0 1 10.8 5.919a8.783 8.783 0 0 1-1.596 1.766C8.279 8.455 7.186 9 6 9c-1.186 0-2.28-.545-3.204-1.315Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
