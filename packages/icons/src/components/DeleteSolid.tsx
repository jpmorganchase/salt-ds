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
        <path
          fillRule="evenodd"
          d="M3 1a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1h3v1h-1v7.25A1.75 1.75 0 0 1 8.25 12H3a2 2 0 0 1-2-2V3H0V2h3V1Zm1 1h3v-.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5V2ZM3 4h1v6H3V4Zm2 0h1v6H5V4Zm2 0h1v6H7V4Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
