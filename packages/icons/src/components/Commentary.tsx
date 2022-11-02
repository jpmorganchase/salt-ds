import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CommentaryIconProps = IconProps;

export const CommentaryIcon = forwardRef<SVGSVGElement, CommentaryIconProps>(
  function CommentaryIcon(props: CommentaryIconProps, ref) {
    return (
      <Icon
        data-testid="CommentaryIcon"
        aria-label="commentary"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M9 2H3v1h6V2z" />
          <path d="M9 4H3v1h6V4z" />
          <path d="M3 6h4v1H3V6z" />
          <path d="M2 0a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2v3l3.443-3H10a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zM1 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5.057L3 9.739V8H2a1 1 0 0 1-1-1V2z" />
        </>
      </Icon>
    );
  }
);
