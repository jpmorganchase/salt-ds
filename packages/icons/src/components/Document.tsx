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
        <path d="M1.5.5V0H1v12h10V2.293L8.707 0H1.5v.5zM2 11V1h5v3h3v7H2zm8-8H8V1h.293L10 2.707V3z" />
      </Icon>
    );
  }
);
