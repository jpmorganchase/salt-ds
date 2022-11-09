import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CommentarySolidIconProps = IconProps;

export const CommentarySolidIcon = forwardRef<
  SVGSVGElement,
  CommentarySolidIconProps
>(function CommentarySolidIcon(props: CommentarySolidIconProps, ref) {
  return (
    <Icon
      data-testid="CommentarySolidIcon"
      aria-label="commentary solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M2 0a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2v3l3.443-3H10a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm1 2h6v1H3V2zm0 2h6v1H3V4zm0 2h4v1H3V6z" />
    </Icon>
  );
});
