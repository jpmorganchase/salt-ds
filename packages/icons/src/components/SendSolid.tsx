import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SendSolidIconProps = IconProps;

export const SendSolidIcon = forwardRef<SVGSVGElement, SendSolidIconProps>(
  function SendSolidIcon(props: SendSolidIconProps, ref) {
    return (
      <Icon
        data-testid="SendSolidIcon"
        aria-label="send solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M2 7 0 5l12-5-5 12-2-2-.762-1.523L9.5 3.2 10 2l-1.195.5-5.283 5.26L2 7Z" />
      </Icon>
    );
  }
);
