// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

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
        d="M6 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m-.25-2.5V6h.5v2h-1.5v-.5z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M1 0v12h10V2L9 0zm6 4h3v7H2V1h5zm3-1v-.586L8.586 1H8v2z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
