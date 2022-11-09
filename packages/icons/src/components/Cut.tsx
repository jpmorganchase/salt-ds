import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CutIconProps = IconProps;

export const CutIcon = forwardRef<SVGSVGElement, CutIconProps>(function CutIcon(
  props: CutIconProps,
  ref
) {
  return (
    <Icon
      data-testid="CutIcon"
      aria-label="cut"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="m1.967 0 3.726 4.769-1.115 1.428a294.918 294.918 0 0 1-2.567-3.338C1.414 2.039.928.811 1.967-.001zm6.382 11.049a1.584 1.584 0 1 0 .677-2.013L7.454 7.023l-.477.614-.641.825 2.013 2.587zm2.275-.65a.823.823 0 1 1-1.645.035.823.823 0 0 1 1.645-.035z" />
      <path d="M10.019 2.86c-.576.792-6.044 7.813-6.417 8.291a1.584 1.584 0 1 1-.607-2.103L10.063.001c1.038.811.552 2.039-.044 2.86zm-7.803 8.38a.824.824 0 1 0-.035-1.647.824.824 0 0 0 .035 1.647zm3.802-3.929a.634.634 0 1 0 0-1.268.634.634 0 0 0 0 1.268z" />
    </Icon>
  );
});
