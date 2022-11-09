import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type NoteSolidIconProps = IconProps;

export const NoteSolidIcon = forwardRef<SVGSVGElement, NoteSolidIconProps>(
  function NoteSolidIcon(props: NoteSolidIconProps, ref) {
    return (
      <Icon
        data-testid="NoteSolidIcon"
        aria-label="note solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M9.207 11H1V1h10v8.207L9.207 11zM7 10h1V8h2V7H7v3z" />
      </Icon>
    );
  }
);
