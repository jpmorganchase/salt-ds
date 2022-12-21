import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type EditIconProps = IconProps;

export const EditIcon = forwardRef<SVGSVGElement, EditIconProps>(
  function EditIcon(props: EditIconProps, ref) {
    return (
      <Icon
        data-testid="EditIcon"
        aria-label="edit"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M9.564.293a1 1 0 0 0-1.415 0L6.735 1.707l3.536 3.536 1.414-1.415a1 1 0 0 0 0-1.414L9.564.293Zm-.354 1.06a.5.5 0 0 0-.707 0l-.354.354 2.122 2.121.353-.353a.5.5 0 0 0 0-.707L9.21 1.354Z"
          clipRule="evenodd"
        />
        <path d="m7.442 3.828.707.708L4.26 8.425a.5.5 0 1 1-.707-.707l3.89-3.89Z" />
        <path d="m8.857 5.243.707.707-4.243 4.242L0 12l1.786-5.343 4.207-4.208.707.707-4.03 4.031-.796 2.387.53.53 2.387-.795 4.066-4.066Z" />
      </Icon>
    );
  }
);
