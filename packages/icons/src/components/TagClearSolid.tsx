import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type TagClearSolidIconProps = IconProps;

export const TagClearSolidIcon = forwardRef<
  SVGSVGElement,
  TagClearSolidIconProps
>(function TagClearSolidIcon(props: TagClearSolidIconProps, ref) {
  return (
    <Icon
      data-testid="TagClearSolidIcon"
      aria-label="tag clear solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M8 3.5a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0Z" />
      <path
        fillRule="evenodd"
        d="M12 0H7L0 7l5 5 .65-.65-1.064-1.064L6.372 8.5 4.586 6.714l2.128-2.128L8.5 6.372l1.786-1.786L11.35 5.65 12 5V0ZM8.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
        clipRule="evenodd"
      />
      <path d="M10.286 11 8.5 9.214 6.714 11 6 10.286 7.786 8.5 6 6.714 6.714 6 8.5 7.786 10.286 6l.714.714L9.214 8.5 11 10.286l-.714.714Z" />
    </Icon>
  );
});
