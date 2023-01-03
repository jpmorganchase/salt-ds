import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SettingsSolidIconProps = IconProps;

export const SettingsSolidIcon = forwardRef<
  SVGSVGElement,
  SettingsSolidIconProps
>(function SettingsSolidIcon(props: SettingsSolidIconProps, ref) {
  return (
    <Icon
      data-testid="SettingsSolidIcon"
      aria-label="settings solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M6.997.082a1 1 0 0 1-1.994 0 5.968 5.968 0 0 0-2.482 1.03A1 1 0 0 1 1.11 2.52 5.968 5.968 0 0 0 .082 5.003a1 1 0 0 1 0 1.994 5.968 5.968 0 0 0 1.03 2.482 1 1 0 0 1 1.409 1.41 5.968 5.968 0 0 0 2.482 1.029 1 1 0 0 1 1.994 0 5.968 5.968 0 0 0 2.482-1.03 1 1 0 0 1 1.41-1.409 5.968 5.968 0 0 0 1.029-2.482 1 1 0 0 1 0-1.994 5.968 5.968 0 0 0-1.03-2.482A1 1 0 0 1 9.48 1.11 5.968 5.968 0 0 0 6.997.082ZM6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
