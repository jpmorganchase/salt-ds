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
        <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm3 1 1 1v2H3l2-2 1 1 2-2Z" />
        <path
          fillRule="evenodd"
          d="M1 0v12h10V2L9 0H1Zm9 4v7H2V1h5v3h3Zm0-1v-.586L8.586 1H8v2h2Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
