import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ImageSolidIconProps = IconProps;

export const ImageSolidIcon = forwardRef<SVGSVGElement, ImageSolidIconProps>(
  function ImageSolidIcon(props: ImageSolidIconProps, ref) {
    return (
      <Icon
        data-testid="ImageSolidIcon"
        aria-label="image solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M1 12V0h8l2 2v10H1ZM7 1h1v2h2v1H7V1ZM5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm3 1 1 1v2H3l2-2 1 1 2-2Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
