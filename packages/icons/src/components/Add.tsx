import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type AddIconProps = IconProps;

export const AddIcon = forwardRef<SVGSVGElement, AddIconProps>(function AddIcon(
  props: AddIconProps,
  ref
) {
  return (
    <Icon
      data-testid="AddIcon"
      aria-label="add"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M7 0H5v5H0v2h5v5h2V7h5V5H7V0z" />
    </Icon>
  );
});
