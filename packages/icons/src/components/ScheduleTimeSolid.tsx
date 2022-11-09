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
      <path d="M5.75 7.5V6h.5v2h-1.5v-.5h1Z" />
      <path
        fillRule="evenodd"
        d="M8.707 0H1v12h10V2.293L8.707 0ZM7 1h1v2h2v1H7V1Zm1.5 6.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
