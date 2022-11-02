import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DatabaseIconProps = IconProps;

export const DatabaseIcon = forwardRef<SVGSVGElement, DatabaseIconProps>(
  function DatabaseIcon(props: DatabaseIconProps, ref) {
    return (
      <Icon
        data-testid="DatabaseIcon"
        aria-label="database"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M2 2.25h1v1H2v-1z" />
          <path d="M3 8.75H2v1h1v-1z" />
          <path d="M5 8.75H4v1h1v-1z" />
          <path d="M5 2.25H4v1h1v-1z" />
          <path d="M0 5.5h12V0H0v5.5zM1 1h10v3.5H1V1z" />
          <path d="M0 12h12V6.5H0V12zm1-4.5h10V11H1V7.5z" />
        </>
      </Icon>
    );
  }
);
