import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type Forward5IconProps = IconProps;

export const Forward5Icon = forwardRef<SVGSVGElement, Forward5IconProps>(
  function Forward5Icon(props: Forward5IconProps, ref) {
    return (
      <Icon
        data-testid="Forward5Icon"
        aria-label="forward 5"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M4.021 2C1.772 2-.04 3.835.001 6.071.04 8.252 1.829 10 4.021 10H8v2l4-2.5L8 7v2H4.021a3.008 3.008 0 0 1-3.015-2.946A3.008 3.008 0 0 1 4.021 3V2z" />
          <path d="M8.385 2.126c.321 0 .604.058.848.174.246.114.437.283.574.506.137.221.205.492.205.813 0 .351-.074.654-.222.909-.148.253-.366.448-.653.584s-.637.205-1.049.205c-.262 0-.507-.023-.735-.068a2.033 2.033 0 0 1-.584-.205v-.725a2.867 2.867 0 0 0 1.302.325c.232 0 .432-.034.598-.103s.294-.173.383-.314a.973.973 0 0 0 .137-.537c0-.287-.092-.508-.277-.663-.182-.157-.468-.236-.858-.236-.137 0-.283.013-.437.038-.153.023-.28.048-.383.075l-.352-.208L7.07.252h2.598V.96h-1.89l-.109 1.244c.082-.018.18-.035.294-.051.114-.018.255-.027.424-.027z" />
        </>
      </Icon>
    );
  }
);
