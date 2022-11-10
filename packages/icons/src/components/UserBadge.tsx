import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type UserBadgeIconProps = IconProps;

export const UserBadgeIcon = forwardRef<SVGSVGElement, UserBadgeIconProps>(
  function UserBadgeIcon(props: UserBadgeIconProps, ref) {
    return (
      <Icon
        data-testid="UserBadgeIcon"
        aria-label="user badge"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M12 6A6 6 0 1 0 0 6a6 6 0 0 0 12 0zM9.449 9.44A4.863 4.863 0 0 1 5.875 11a4.862 4.862 0 0 1-3.534-1.517c.114-.039.244-.078.396-.122l.273-.077.028-.008.3-.088c.916-.282 1.342-.598 1.407-1.185-.744-.824-1.244-2.272-1.244-3.503 0-1.841 1.119-2.5 2.5-2.5s2.5.659 2.5 2.5c0 1.268-.532 2.768-1.314 3.577.092.54.52.841 1.397 1.111.088.028.181.054.3.088l.028.008.273.077c.097.028.185.054.266.08z" />
      </Icon>
    );
  }
);
