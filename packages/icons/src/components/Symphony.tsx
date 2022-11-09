import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SymphonyIconProps = IconProps;

export const SymphonyIcon = forwardRef<SVGSVGElement, SymphonyIconProps>(
  function SymphonyIcon(props: SymphonyIconProps, ref) {
    return (
      <Icon
        data-testid="SymphonyIcon"
        aria-label="symphony"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M9.625 4.382V2.624c0-.36-.2-.699-.522-.883C8.621 1.464 7.576 1 6 1s-2.621.464-3.103.74c-.158.091-.289.22-.381.375s-.14.33-.141.509v2.641l5.74 1.618V8.06c0 .159-.103.271-.277.354L6 9.31l-1.847-.901c-.165-.078-.268-.19-.268-.349v-.883l-1.51-.441V8.06c0 .727.428 1.345 1.108 1.667L6 11.001l2.508-1.27c.689-.327 1.117-.945 1.117-1.671V5.854L3.886 4.236V2.893c.41-.193 1.109-.422 2.115-.422s1.705.229 2.115.422v1.049l1.511.441z" />
      </Icon>
    );
  }
);
