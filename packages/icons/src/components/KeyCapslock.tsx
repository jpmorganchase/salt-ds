import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type KeyCapslockIconProps = IconProps;

export const KeyCapslockIcon = forwardRef<SVGSVGElement, KeyCapslockIconProps>(
  function KeyCapslockIcon(props: KeyCapslockIconProps, ref) {
    return (
      <Icon
        data-testid="KeyCapslockIcon"
        aria-label="key capslock"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M9 8H3v3h6V8ZM8 9H4v1h4V9Zm3-3H9v1H3V6H1l5-6 5 6ZM8.865 5 6 1.562 3.135 5H4v1h4V5h.865Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
