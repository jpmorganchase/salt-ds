import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ScheduleTimeIconProps = IconProps;

export const ScheduleTimeIcon = forwardRef<
  SVGSVGElement,
  ScheduleTimeIconProps
>(function ScheduleTimeIcon(props: ScheduleTimeIconProps, ref) {
  return (
    <Icon
      data-testid="ScheduleTimeIcon"
      aria-label="schedule time"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <>
        <path d="M8.5 7.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM6.25 6h-.5v1.5h-1V8h1.5V6z" />
        <path d="M8.707 0 11 2.293V12H1V0h7.707zM2 1v10h8V4H7V1H2zm8 1.707L8.293 1H8v2h2v-.293z" />
      </>
    </Icon>
  );
});
