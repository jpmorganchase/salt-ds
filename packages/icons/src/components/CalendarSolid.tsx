import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CalendarSolidIconProps = IconProps;

export const CalendarSolidIcon = forwardRef<
  SVGSVGElement,
  CalendarSolidIconProps
>(function CalendarSolidIcon(props: CalendarSolidIconProps, ref) {
  return (
    <Icon
      data-testid="CalendarSolidIcon"
      aria-label="calendar solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M3.996 1.008V0H3v1.008H0V12h12V1.008H9V0h-.996v1.008H3.996zM1 2.004h2v1h1v-1h4v1h1v-1h2v2H1v-2z" />
    </Icon>
  );
});
