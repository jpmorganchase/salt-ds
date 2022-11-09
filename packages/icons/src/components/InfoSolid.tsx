import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type InfoSolidIconProps = IconProps;

export const InfoSolidIcon = forwardRef<SVGSVGElement, InfoSolidIconProps>(
  function InfoSolidIcon(props: InfoSolidIconProps, ref) {
    return (
      <Icon
        data-testid="InfoSolidIcon"
        aria-label="info solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M12 0H0v12h12V0ZM5 2h2v2H5V2Zm0 3h2v5H5V5Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
