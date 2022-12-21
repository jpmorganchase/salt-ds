import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DeleteIconProps = IconProps;

export const DeleteIcon = forwardRef<SVGSVGElement, DeleteIconProps>(
  function DeleteIcon(props: DeleteIconProps, ref) {
    return (
      <Icon
        data-testid="DeleteIcon"
        aria-label="delete"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M5 4v6H4V4h1Zm2 0v6H6V4h1Z" />
        <path
          fillRule="evenodd"
          d="M4 0a1 1 0 0 0-1 1v1H0v1h1v7a2 2 0 0 0 2 2h5.25A1.75 1.75 0 0 0 10 10.25V3h1V2H8V1a1 1 0 0 0-1-1H4Zm5 3H2v7a1 1 0 0 0 1 1h5.25a.75.75 0 0 0 .75-.75V3ZM7 2H4v-.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V2Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
