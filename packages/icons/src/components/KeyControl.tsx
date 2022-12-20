import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type KeyControlIconProps = IconProps;

export const KeyControlIcon = forwardRef<SVGSVGElement, KeyControlIconProps>(
  function KeyControlIcon(props: KeyControlIconProps, ref) {
    return (
      <Icon
        data-testid="KeyControlIcon"
        aria-label="key control"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="m6 1 3.354 3.354-.708.707L6 2.414 3.354 5.061l-.708-.707L6 1Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
