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
        <path
          fillRule="evenodd"
          d="M1 11V1h10v8.207L9.207 11H1Zm6-1H2V2h8v5H7v3Zm3-2v.793L8.793 10H8V8h2Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
