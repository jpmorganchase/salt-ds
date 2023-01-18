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
        <path d="M9.625 4.383V2.624c0-.36-.2-.699-.522-.883C8.62 1.464 7.576 1 6 1c-1.577 0-2.621.464-3.103.74-.158.091-.29.22-.38.375a1.01 1.01 0 0 0-.142.509v2.64l5.74 1.618V8.06c0 .159-.103.27-.278.354L6 9.309l-1.847-.901c-.165-.078-.268-.19-.268-.35v-.882l-1.51-.441v1.324c0 .726.428 1.345 1.108 1.667L6 11l2.508-1.27c.689-.326 1.117-.945 1.117-1.67V5.852l-5.74-1.618V2.892C4.295 2.7 4.995 2.47 6 2.47c1.005 0 1.704.23 2.114.422v1.05l1.511.44Z" />
      </Icon>
    );
  }
);
