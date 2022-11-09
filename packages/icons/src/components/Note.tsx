import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type NoteIconProps = IconProps;

export const NoteIcon = forwardRef<SVGSVGElement, NoteIconProps>(
  function NoteIcon(props: NoteIconProps, ref) {
    return (
      <Icon
        data-testid="NoteIcon"
        aria-label="note"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M1 11h8.207L11 9.207V1H1v10zm6-1H2V2h8v5H7v3zm3-2v.793L8.793 10H8V8h2z" />
      </Icon>
    );
  }
);
