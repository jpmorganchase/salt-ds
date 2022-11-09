import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CalendarIconProps = IconProps;

export const CalendarIcon = forwardRef<SVGSVGElement, CalendarIconProps>(
  function CalendarIcon(props: CalendarIconProps, ref) {
    return (
      <Icon
        data-testid="CalendarIcon"
        aria-label="calendar"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M3.996 0v1.008h4.008V0H9v1.008h3V12H0V1.008h3V0h.996zm7.008 4.008H.996v6.996h10.008V4.008zM9 2.004h-.996V3H9v-.996zm-5.004 0H3V3h.996v-.996z" />
      </Icon>
    );
  }
);
