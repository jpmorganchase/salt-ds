import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ColumnChooserSolidIconProps = IconProps;

export const ColumnChooserSolidIcon = forwardRef<
  SVGSVGElement,
  ColumnChooserSolidIconProps
>(function ColumnChooserSolidIcon(props: ColumnChooserSolidIconProps, ref) {
  return (
    <Icon
      data-testid="ColumnChooserSolidIcon"
      aria-label="column chooser solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M0 12h12V0H0v12zM1 2h10v1H6v1h3v1H6v1h3v1H6v1h3v1H6v2H5V3H1V2zm0 2h3v1H1V4zm3 2v1H1V6h3zm0 2v1H1V8h3z" />
    </Icon>
  );
});
