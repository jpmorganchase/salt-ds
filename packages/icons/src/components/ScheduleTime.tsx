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
      <path
        fillRule="evenodd"
        d="M6 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-.25-2.5V6h.5v2h-1.5v-.5h1Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M1 0v12h10V2L9 0H1Zm6 4h3v7H2V1h5v3Zm3-1v-.586L8.586 1H8v2h2Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
