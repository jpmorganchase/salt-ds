import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DashboardIconProps = IconProps;

export const DashboardIcon = forwardRef<SVGSVGElement, DashboardIconProps>(
  function DashboardIcon(props: DashboardIconProps, ref) {
    return (
      <Icon
        data-testid="DashboardIcon"
        aria-label="dashboard"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M6 8a1.5 1.5 0 0 0 1.404-2.03l1.59-1.59-.708-.707-1.53 1.53A1.5 1.5 0 1 0 6 8Zm.75-1.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
          clipRule="evenodd"
        />
        <path d="M11.197 10A6 6 0 1 0 .802 10h10.395ZM11 7c0 .711-.149 1.387-.416 2H1.416A4.98 4.98 0 0 1 1 7h1.5c0-.348.05-.683.145-1H1.1a4.987 4.987 0 0 1 1.262-2.43l1.061 1.06c.228-.246.49-.46.78-.634L3.119 2.913c.686-.485 1.5-.8 2.38-.888v1.51a3.545 3.545 0 0 1 1 0v-1.51A5.003 5.003 0 0 1 10.9 6H9.354c.095.317.146.652.146 1H11Z" />
      </Icon>
    );
  }
);
