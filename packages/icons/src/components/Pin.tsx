import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PinIconProps = IconProps;

export const PinIcon = forwardRef<SVGSVGElement, PinIconProps>(function PinIcon(
  props: PinIconProps,
  ref
) {
  return (
    <Icon
      data-testid="PinIcon"
      aria-label="pin"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M2.714 4.297a2.017 2.017 0 0 1 2.857 0L7 2.864l-.714-.717L8.429 0 12 3.58 9.857 5.73l-.714-.717-1.429 1.432a2.03 2.03 0 0 1 0 2.865L7 10.026l-2.026-2.03-2.994 3.001L0 12l.99-1.995 2.994-3.002L2 5.013l.714-.716ZM7.7 2.148l.729-.73 2.157 2.163-.729.73-.714-.716L6.3 6.445l.707.71a1.023 1.023 0 0 1 0 1.446L7 8.608 3.414 5.013l.007-.007c.399-.4 1.045-.4 1.443 0l.707.709 2.843-2.85-.714-.717Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
