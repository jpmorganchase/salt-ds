import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ThumbsDownSolidIconProps = IconProps;

export const ThumbsDownSolidIcon = forwardRef<
  SVGSVGElement,
  ThumbsDownSolidIconProps
>(function ThumbsDownSolidIcon(props: ThumbsDownSolidIconProps, ref) {
  return (
    <Icon
      data-testid="ThumbsDownSolidIcon"
      aria-label="thumbs down solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <>
        <path d="M10 0v7h2V0h-2z" />
        <path d="M8 12H6.5A1.5 1.5 0 0 1 5 10.5V8H1.5A1.5 1.5 0 0 1 0 6.5V4l2-4h7v7L8 9v3z" />
      </>
    </Icon>
  );
});
