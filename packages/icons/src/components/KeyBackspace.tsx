import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type KeyBackspaceIconProps = IconProps;

export const KeyBackspaceIcon = forwardRef<
  SVGSVGElement,
  KeyBackspaceIconProps
>(function KeyBackspaceIcon(props: KeyBackspaceIconProps, ref) {
  return (
    <Icon
      data-testid="KeyBackspaceIcon"
      aria-label="key backspace"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="m0 6 4-4h7v8H4L0 6Zm4.414 3H10V3H4.414l-3 3 3 3Z"
        clipRule="evenodd"
      />
      <path d="M6.536 6.707 7.95 8.121l.707-.707L7.243 6l1.414-1.414-.707-.707-1.414 1.414L5.12 3.879l-.707.707L5.828 6 4.414 7.414l.707.707 1.415-1.414Z" />
    </Icon>
  );
});
