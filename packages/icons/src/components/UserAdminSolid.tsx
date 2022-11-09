import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type UserAdminSolidIconProps = IconProps;

export const UserAdminSolidIcon = forwardRef<
  SVGSVGElement,
  UserAdminSolidIconProps
>(function UserAdminSolidIcon(props: UserAdminSolidIconProps, ref) {
  return (
    <Icon
      data-testid="UserAdminSolidIcon"
      aria-label="user admin solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M6 12c4.813-2.182 5.5-7.364 5.5-10.091l-.418-.067C9.587 1.604 8.139 1.373 6 0 3.861 1.373 2.413 1.603.918 1.842L.5 1.909C.5 4.636 1.188 9.818 6 12zm2.504-3.223A7.453 7.453 0 0 1 6 10.887a7.474 7.474 0 0 1-2.504-2.11l.06-.015c.041-.018.082-.032.123-.044.393-.117.688-.252.888-.404s.322-.349.369-.589c-.176-.182-.337-.398-.483-.65s-.27-.521-.369-.809a5.736 5.736 0 0 1-.246-.879 4.67 4.67 0 0 1-.088-.888c0-.41.059-.759.176-1.046s.278-.519.483-.694c.205-.182.442-.311.712-.387.275-.082.568-.123.879-.123s.604.041.879.123a1.786 1.786 0 0 1 1.195 1.081c.117.287.176.636.176 1.046 0 .287-.029.583-.088.888a5.852 5.852 0 0 1-.246.879c-.1.287-.223.557-.369.809s-.308.469-.483.65c.047.24.17.437.369.589s.495.287.888.404c.041.012.082.026.123.044l.06.015z" />
    </Icon>
  );
});
