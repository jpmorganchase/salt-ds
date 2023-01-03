import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ScheduleTimeSolidIconProps = IconProps;

export const ScheduleTimeSolidIcon = forwardRef<
  SVGSVGElement,
  ScheduleTimeSolidIconProps
>(function ScheduleTimeSolidIcon(props: ScheduleTimeSolidIconProps, ref) {
  return (
    <Icon
      data-testid="ScheduleTimeSolidIcon"
      aria-label="schedule time solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M5.75 6v1.5h-1V8h1.5V6h-.5Z" />
      <path
        fillRule="evenodd"
        d="M1 0v12h10V2L9 0H1Zm7 1H7v3h3V3H8V1Zm.5 6.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
