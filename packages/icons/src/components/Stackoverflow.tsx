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
      <>
        <path d="M10.453 3.818 5.825 0l-.636.771 4.628 3.818.636-.771z" />
        <path d="M1 11V7h1v3h8V7h1v4H1z" />
        <path d="M3 8h6v1H3V8z" />
        <path d="m3.17 5.5 5.91 1.036-.09.985-5.91-1.036.09-.985z" />
        <path d="M9.601 4.969 4.019 2.768l-.424.947 5.582 2.201.424-.947z" />
      </>
    </Icon>
  );
});
