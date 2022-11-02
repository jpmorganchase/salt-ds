import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ThumbsUpIconProps = IconProps;

export const ThumbsUpIcon = forwardRef<SVGSVGElement, ThumbsUpIconProps>(
  function ThumbsUpIcon(props: ThumbsUpIconProps, ref) {
    return (
      <Icon
        data-testid="ThumbsUpIcon"
        aria-label="thumbs up"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M2 12V5H0v7h2z" />
          <path d="m5 3.236-1 2V11h5.382L11 7.764V5.5a.5.5 0 0 0-.5-.5H6V1.5a.5.5 0 0 0-.5-.5H5v2.236zM4 0h1.5A1.5 1.5 0 0 1 7 1.5V4h3.5A1.5 1.5 0 0 1 12 5.5V8l-2 4H3V5l1-2V0z" />
        </>
      </Icon>
    );
  }
);
