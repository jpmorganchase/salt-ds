import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DashboardSolidIconProps = IconProps;

export const DashboardSolidIcon = forwardRef<
  SVGSVGElement,
  DashboardSolidIconProps
>(function DashboardSolidIcon(props: DashboardSolidIconProps, ref) {
  return (
    <Icon
      data-testid="DashboardSolidIcon"
      aria-label="dashboard solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M6 7.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
      <path
        fillRule="evenodd"
        d="M11.197 10A6 6 0 1 0 .802 10h10.395ZM5.5 2.025v1.51a3.53 3.53 0 0 1 1 0v-1.51a5.059 5.059 0 0 0-1 0ZM2.362 3.57l1.062 1.06c.227-.246.49-.46.779-.634L3.12 2.913a5.027 5.027 0 0 0-.758.657ZM2.5 7H1c0-.342.034-.677.1-1h1.545A3.5 3.5 0 0 0 2.5 7Zm8.4-1H9.355A3.5 3.5 0 0 1 9.5 7H11c0-.342-.034-.677-.1-1Zm-3.4.5c0-.187-.034-.365-.096-.53l1.59-1.59-.708-.706-1.53 1.53A1.5 1.5 0 1 0 7.5 6.5Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
