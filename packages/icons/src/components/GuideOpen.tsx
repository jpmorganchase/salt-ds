import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type GuideOpenIconProps = IconProps;

export const GuideOpenIcon = forwardRef<SVGSVGElement, GuideOpenIconProps>(
  function GuideOpenIcon(props: GuideOpenIconProps, ref) {
    return (
      <Icon
        data-testid="GuideOpenIcon"
        aria-label="guide open"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M2 3h2.5v1H2V3z" />
          <path d="M10 3H7.5v1H10V3z" />
          <path d="M7.5 5H10v1H7.5V5z" />
          <path d="M4.5 5H2v1h2.5V5z" />
          <path d="M7.5 7H10v1H7.5V7z" />
          <path d="M4.5 7H2v1h2.5V7z" />
          <path d="M12 1v9.5H7c-.22 0-.327.073-.385.14A.55.55 0 0 0 6.5 11h-1c0-.087-.049-.217-.166-.334S5.087 10.5 5 10.5H0V1h5c.371 0 .707.162.959.382C6.22 1.138 6.577 1 7 1h5zM5 2H1v7.5h4c.371 0 .707.162.959.382C6.22 9.638 6.577 9.5 7 9.5h4V2H7c-.22 0-.327.073-.385.14a.55.55 0 0 0-.115.36v6h-1v-6c0-.087-.049-.217-.166-.334S5.087 2 5 2z" />
        </>
      </Icon>
    );
  }
);
