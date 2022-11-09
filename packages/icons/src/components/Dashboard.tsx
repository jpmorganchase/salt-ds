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
        <path d="M6 8a1.5 1.5 0 0 0 1.404-2.03l1.589-1.589-.707-.707-1.53 1.53A1.5 1.5 0 1 0 6 8zm.75-1.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z" />
        <path d="M11.197 10A6 6 0 1 0 0 7c0 1.093.292 2.118.802 3h10.395zM11 7c0 .711-.149 1.387-.416 2H1.416A4.975 4.975 0 0 1 1 7h1.5c0-.348.051-.683.145-1H1.1a4.992 4.992 0 0 1 1.262-2.43l1.061 1.061c.227-.247.49-.461.779-.635L3.119 2.913c.686-.484 1.5-.8 2.38-.888v1.511a3.577 3.577 0 0 1 1 0V2.025A5.003 5.003 0 0 1 10.899 6H9.354c.094.317.145.652.145 1h1.5z" />
      </Icon>
    );
  }
);
