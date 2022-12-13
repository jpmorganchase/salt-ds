import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ApiIconProps = IconProps;

export const ApiIcon = forwardRef<SVGSVGElement, ApiIconProps>(function ApiIcon(
  props: ApiIconProps,
  ref
) {
  return (
    <Icon
      data-testid="ApiIcon"
      aria-label="api"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M0 5.99 3 3l.707.705-2.293 2.284 2.293 2.296L3 8.99l-3-3Zm12 .022L9 9l-.708-.704 2.293-2.284-2.293-2.296.707-.704 3.001 3Zm-5.05-3L4.002 8.543l.895.446 2.948-5.533-.895-.446Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
