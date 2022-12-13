import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CloseSmallIconProps = IconProps;

export const CloseSmallIcon = forwardRef<SVGSVGElement, CloseSmallIconProps>(
  function CloseSmallIcon(props: CloseSmallIconProps, ref) {
    return (
      <Icon
        data-testid="CloseSmallIcon"
        aria-label="close small"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="m9.182 9.889.707-.707L6.707 6l3.182-3.182-.707-.707L6 5.293 2.818 2.111l-.707.707L5.293 6 2.111 9.182l.707.707L6 6.707l3.182 3.182z" />
      </Icon>
    );
  }
);
