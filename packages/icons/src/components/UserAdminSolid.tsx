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
      <path
        fillRule="evenodd"
        d="M6 12C1.188 9.818.5 4.636.5 1.91c.14-.024.28-.046.418-.068C2.413 1.603 3.861 1.372 6 0c2.139 1.373 3.587 1.603 5.082 1.842l.418.067C11.5 4.636 10.812 9.82 6 12Zm2.504-3.223A7.465 7.465 0 0 1 6 10.887a7.465 7.465 0 0 1-2.504-2.11l.06-.014a.922.922 0 0 1 .124-.044c.392-.117.688-.252.887-.405a.949.949 0 0 0 .37-.588 3.352 3.352 0 0 1-.484-.65 4.612 4.612 0 0 1-.369-.81 5.759 5.759 0 0 1-.246-.878A4.697 4.697 0 0 1 3.75 4.5c0-.41.059-.759.176-1.046A1.795 1.795 0 0 1 5.12 2.373c.275-.082.568-.123.879-.123.31 0 .604.041.879.123a1.795 1.795 0 0 1 1.195 1.081c.117.287.176.636.176 1.046 0 .287-.03.583-.088.888-.058.299-.14.591-.246.879-.1.287-.223.556-.37.808a3.352 3.352 0 0 1-.483.65c.047.24.17.437.37.59.199.152.495.287.887.404a.864.864 0 0 1 .123.044l.06.014Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
