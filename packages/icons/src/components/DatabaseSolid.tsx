import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DatabaseSolidIconProps = IconProps;

export const DatabaseSolidIcon = forwardRef<
  SVGSVGElement,
  DatabaseSolidIconProps
>(function DatabaseSolidIcon(props: DatabaseSolidIconProps, ref) {
  return (
    <Icon
      data-testid="DatabaseSolidIcon"
      aria-label="database solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M0 5.5h12V0H0v5.5zm2-3.25h1v1H2v-1zm2 0h1v1H4v-1zM0 12h12V6.5H0V12zm2-3.25h1v1H2v-1zm2 0h1v1H4v-1z" />
    </Icon>
  );
});
