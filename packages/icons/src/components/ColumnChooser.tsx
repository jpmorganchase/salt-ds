import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ColumnChooserIconProps = IconProps;

export const ColumnChooserIcon = forwardRef<
  SVGSVGElement,
  ColumnChooserIconProps
>(function ColumnChooserIcon(props: ColumnChooserIconProps, ref) {
  return (
    <Icon
      data-testid="ColumnChooserIcon"
      aria-label="column chooser"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M0 0h12v12H0V0zm1 3v1h3v1H1v1h3v1H1v1h3v1H1v2h4V3H1zm5 0v1h3v1H6v1h3v1H6v1h3v1H6v2h5V3H6zm5-2H1v1h10V1z" />
    </Icon>
  );
});
