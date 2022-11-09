import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type BookmarkSolidIconProps = IconProps;

export const BookmarkSolidIcon = forwardRef<
  SVGSVGElement,
  BookmarkSolidIconProps
>(function BookmarkSolidIcon(props: BookmarkSolidIconProps, ref) {
  return (
    <Icon
      data-testid="BookmarkSolidIcon"
      aria-label="bookmark solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path fillRule="evenodd" d="m6 10 4 2V0H2v12l4-2Z" clipRule="evenodd" />
    </Icon>
  );
});
