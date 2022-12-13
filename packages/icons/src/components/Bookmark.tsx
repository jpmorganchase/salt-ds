import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type BookmarkIconProps = IconProps;

export const BookmarkIcon = forwardRef<SVGSVGElement, BookmarkIconProps>(
  function BookmarkIcon(props: BookmarkIconProps, ref) {
    return (
      <Icon
        data-testid="BookmarkIcon"
        aria-label="bookmark"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="m6 10 4 2V0H2v12l4-2Zm-3 .234 3-1.4 3 1.4V1H3v9.234Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
