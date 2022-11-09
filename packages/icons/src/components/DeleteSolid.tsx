import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DeleteSolidIconProps = IconProps;

export const DeleteSolidIcon = forwardRef<SVGSVGElement, DeleteSolidIconProps>(
  function DeleteSolidIcon(props: DeleteSolidIconProps, ref) {
    return (
      <Icon
        data-testid="DeleteSolidIcon"
        aria-label="delete solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M3 1v1H0v1h1v7a2 2 0 0 0 2 2h5.25A1.75 1.75 0 0 0 10 10.25V3h1V2H8V1a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1zm1 1v-.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V2H4zM3 4h1v6H3V4zm2 0h1v6H5V4zm2 0h1v6H7V4z" />
      </Icon>
    );
  }
);
