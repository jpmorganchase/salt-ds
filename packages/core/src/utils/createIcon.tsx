import { ForwardedRef, forwardRef, memo, ReactNode } from "react";
import { Icon, IconProps } from "../icon";

/**
 * Private utility.
 */
export function createIcon(
  svg: ReactNode,
  displayName: string,
  ariaLabel: string
) {
  const Component = (props: IconProps, ref: ForwardedRef<HTMLSpanElement>) => (
    <Icon aria-label={ariaLabel} role="img" ref={ref} {...props}>
      {svg}
    </Icon>
  );

  if (process.env.NODE_ENV !== "production") {
    Component.displayName = `${displayName}Icon`;
  }

  return memo(forwardRef(Component));
}
