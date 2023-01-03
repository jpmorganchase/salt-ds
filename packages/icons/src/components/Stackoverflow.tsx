import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type StackoverflowIconProps = IconProps;

export const StackoverflowIcon = forwardRef<
  SVGSVGElement,
  StackoverflowIconProps
>(function StackoverflowIcon(props: StackoverflowIconProps, ref) {
  return (
    <Icon
      data-testid="StackoverflowIcon"
      aria-label="stackoverflow"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M10.453 3.818 5.825 0l-.636.771L9.817 4.59l.636-.772ZM1 11V7h1v3h8V7h1v4H1Z" />
      <path d="M3 8h6v1H3V8Zm.17-2.5 5.91 1.036-.09.985-5.91-1.036.09-.985Zm6.43-.531L4.02 2.767l-.425.947 5.581 2.202.425-.947Z" />
    </Icon>
  );
});
