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
          clipRule="evenodd"
          d="M1 0h8.207L11 1.793V12H1V0Zm7 1H7v3h3V3H8V1ZM4 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm5 1L8 7 6 9 5 8l-2 2h6V8Z"
        />
      </Icon>
    );
  }
);
