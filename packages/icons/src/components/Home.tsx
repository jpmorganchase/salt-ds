import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type HomeIconProps = IconProps;

export const HomeIcon = forwardRef<SVGSVGElement, HomeIconProps>(
  function HomeIcon(props: HomeIconProps, ref) {
    return (
      <Icon
        data-testid="HomeIcon"
        aria-label="home"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M0 4.875 6 0l6 4.875L11 6l-1-.825V12H7V9H5v3H2V5.095L.875 6 0 4.875Zm3-.585V11h1V8h4v3h1V4.35L6 1.875 3 4.29Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
