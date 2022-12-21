import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DocumentIconProps = IconProps;

export const DocumentIcon = forwardRef<SVGSVGElement, DocumentIconProps>(
  function DocumentIcon(props: DocumentIconProps, ref) {
    return (
      <Icon
        data-testid="DocumentIcon"
        aria-label="document"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M1 12V0h8l2 2v10H1Zm9-1V4H7V1H2v10h8Zm0-8.586V3H8V1h.586L10 2.414Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
