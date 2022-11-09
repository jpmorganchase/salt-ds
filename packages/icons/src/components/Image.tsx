import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ImageIconProps = IconProps;

export const ImageIcon = forwardRef<SVGSVGElement, ImageIconProps>(
  function ImageIcon(props: ImageIconProps, ref) {
    return (
      <Icon
        data-testid="ImageIcon"
        aria-label="image"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M8.707 0H1v12h10V2.293L8.707 0ZM1.5.5V0v.5ZM2 1v10h8V4H7V1H2Zm8 1.707V3H8V1h.293L10 2.707Z"
          clipRule="evenodd"
        />
        <path d="M3 10h6V8L8 7 6 9 5 8l-2 2Zm1-3a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      </Icon>
    );
  }
);
