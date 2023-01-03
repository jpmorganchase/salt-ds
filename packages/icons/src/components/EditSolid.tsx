import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type EditSolidIconProps = IconProps;

export const EditSolidIcon = forwardRef<SVGSVGElement, EditSolidIconProps>(
  function EditSolidIcon(props: EditSolidIconProps, ref) {
    return (
      <Icon
        data-testid="EditSolidIcon"
        aria-label="edit solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M8.159.294a1.003 1.003 0 0 1 1.419 0l2.128 2.128a1.003 1.003 0 0 1 0 1.42L10.287 5.26 6.74 1.713 8.159.293ZM1.774 6.679l4.221-4.222.239.239L9.578 5.97 5.32 10.226 0 12l1.774-5.321Z" />
      </Icon>
    );
  }
);
