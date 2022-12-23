import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type HiddenIconProps = IconProps;

export const HiddenIcon = forwardRef<SVGSVGElement, HiddenIconProps>(
  function HiddenIcon(props: HiddenIconProps, ref) {
    return (
      <Icon
        data-testid="HiddenIcon"
        aria-label="hidden"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="m10.576.5 1.06 1.06-1.868 1.87c1.03.812 1.79 1.793 2.232 2.445C11.25 7.25 9 10 6 10a5.32 5.32 0 0 1-2.272-.53L1.56 11.637.5 10.577 2.416 8.66C1.25 7.765.406 6.619 0 5.875.875 4.583 3 2 6 2c.908 0 1.736.237 2.474.603L10.576.5ZM7.427 3.649A2.75 2.75 0 0 0 3.65 7.427l.74-.74A1.75 1.75 0 0 1 6.687 4.39l.741-.741Zm-2.679 4.8A2.75 2.75 0 0 0 8.45 4.748l-.767.768a1.751 1.751 0 0 1-2.166 2.166l-.768.767Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
