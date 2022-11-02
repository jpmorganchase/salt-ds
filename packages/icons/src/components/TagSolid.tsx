import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type TagSolidIconProps = IconProps;

export const TagSolidIcon = forwardRef<SVGSVGElement, TagSolidIconProps>(
  function TagSolidIcon(props: TagSolidIconProps, ref) {
    return (
      <Icon
        data-testid="TagSolidIcon"
        aria-label="tag solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M8.5 4a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7 0h5v5l-7 7-5-5 7-7Zm0 3.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
          />
        </>
      </Icon>
    );
  }
);
