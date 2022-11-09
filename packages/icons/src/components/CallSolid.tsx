import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CallSolidIconProps = IconProps;

export const CallSolidIcon = forwardRef<SVGSVGElement, CallSolidIconProps>(
  function CallSolidIcon(props: CallSolidIconProps, ref) {
    return (
      <Icon
        data-testid="CallSolidIcon"
        aria-label="call solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M8.59 11.998c-.305 0-.672-.109-1.101-.328-.422-.227-.879-.52-1.371-.879-.492-.367-1-.781-1.523-1.242a65.474 65.474 0 0 1-1.523-1.406 9.937 9.937 0 0 1-1.301-1.511 12.22 12.22 0 0 1-.949-1.57 10.27 10.27 0 0 1-.586-1.465 5.701 5.701 0 0 1-.234-1.148 1.353 1.353 0 0 1 .246-.832c.172-.281.394-.531.668-.75.281-.227.586-.418.914-.574S2.471.039 2.767 0l1.652 3.351-.832.961c.086.141.32.445.703.914s.766.898 1.148 1.289c.383.383.781.75 1.195 1.101.422.344.703.555.844.633L8.66 7.37l.375.164.879.387a31.56 31.56 0 0 1 1.77.808l.094.082c.063.055.117.152.164.293.039.141.059.242.059.305v.082c-.141.601-.433 1.07-.879 1.406a7.135 7.135 0 0 1-1.441.855l-.152.059a3.03 3.03 0 0 1-.398.117c-.172.047-.305.07-.398.07h-.141z" />
      </Icon>
    );
  }
);
