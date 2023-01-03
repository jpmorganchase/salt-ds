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
        <path d="M2 3h2.5v1H2V3Zm8 0H7.5v1H10V3ZM7.5 5H10v1H7.5V5Zm-3 0H2v1h2.5V5Zm3 2H10v1H7.5V7Zm-3 0H2v1h2.5V7Z" />
        <path
          fillRule="evenodd"
          d="M12 1H7c-.423 0-.78.138-1.041.382A1.477 1.477 0 0 0 5 1H0v9.5h5a.51.51 0 0 1 .334.166A.51.51 0 0 1 5.5 11h1a.55.55 0 0 1 .115-.36c.058-.067.165-.14.385-.14h5V1ZM5 2H1v7.5h4c.37 0 .707.162.959.382C6.22 9.638 6.577 9.5 7 9.5h4V2H7c-.22 0-.327.073-.385.14a.55.55 0 0 0-.115.36v6h-1v-6a.51.51 0 0 0-.166-.334A.51.51 0 0 0 5 2Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
