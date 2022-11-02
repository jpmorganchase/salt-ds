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
        <>
          <path d="m9.564.293 2.121 2.121a.999.999 0 0 1 0 1.414l-1.414 1.414-3.536-3.536L8.149.292a.999.999 0 0 1 1.414 0zM9.21 1.354a.5.5 0 0 0-.707 0l-.354.354 2.121 2.121.354-.354a.5.5 0 0 0 0-.707L9.21 1.354z" />
          <path d="m7.442 3.828.707.707L4.26 8.424a.5.5 0 0 1-.707-.707l3.889-3.889z" />
          <path d="m8.857 5.243.707.707-4.243 4.243-5.303 1.768 1.768-5.303L5.994 2.45l.707.707L2.67 7.188l-.795 2.386.53.53 2.386-.795 4.066-4.066z" />
        </>
      </Icon>
    );
  }
);
