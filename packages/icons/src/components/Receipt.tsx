// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type ReceiptIconProps = IconProps;

export const ReceiptIcon = forwardRef<SVGSVGElement, ReceiptIconProps>(
  function ReceiptIcon(props: ReceiptIconProps, ref) {
    return (
      <Icon
        data-testid="ReceiptIcon"
        aria-label="receipt"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M8 3H4v1h4V3ZM4 5h4v1H4V5Zm4 2H4v1h4V7Z" />
        <path
          fillRule="evenodd"
          d="M1 0v12l3-1.5L6 12l2-1.5 3 1.5V0H1Zm5 10.5L4 9l-2 1V1h8v9L8 9l-2 1.5Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  },
);
