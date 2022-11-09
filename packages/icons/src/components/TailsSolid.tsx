import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type TailsSolidIconProps = IconProps;

export const TailsSolidIcon = forwardRef<SVGSVGElement, TailsSolidIconProps>(
  function TailsSolidIcon(props: TailsSolidIconProps, ref) {
    return (
      <Icon
        data-testid="TailsSolidIcon"
        aria-label="tails solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M4 5.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1ZM8.5 5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
        <path
          fillRule="evenodd"
          d="M1.248.07C4.316.421 5.5 2 5.5 2h1S7.684.422 10.752.07C11.138.024 11.553 0 12 0l-2 3 2 5-6 4-6-4 1.838-4.594.144-.433L0 0c.447 0 .862.025 1.248.07ZM1.23 7.617l.41-1.023a9.174 9.174 0 0 1 2.342 1.462c.777.683 1.355 1.49 1.489 2.388L1.23 7.618Zm5.336 2.803 4.204-2.803-.34-.852c-.7.314-1.524.775-2.239 1.359-.816.666-1.429 1.442-1.625 2.296Zm3.426-9.21-.039.058.031-.057.008-.001ZM8.55 2.5l1.413-1.284a6.264 6.264 0 0 0-1.717.652 4.237 4.237 0 0 0-.852.632H8.55Zm-4.025-.078c.03.029.058.055.08.078H3.45L2.037 1.216c.743.17 1.307.418 1.717.652.366.21.618.413.77.554Zm-2.509-1.21.031.056-.039-.058.008.001ZM4 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm5-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
