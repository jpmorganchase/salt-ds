import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ImportSolidIconProps = IconProps;

export const ImportSolidIcon = forwardRef<SVGSVGElement, ImportSolidIconProps>(
  function ImportSolidIcon(props: ImportSolidIconProps, ref) {
    return (
      <Icon
        data-testid="ImportSolidIcon"
        aria-label="import solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M12 0H0v5h5V3l4 3-4 3V7H0v5h12V0zM7 1h4v10H7v-1h3V2H7V1z" />
      </Icon>
    );
  }
);
