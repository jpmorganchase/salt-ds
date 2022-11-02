import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PdfIconProps = IconProps;

export const PdfIcon = forwardRef<SVGSVGElement, PdfIconProps>(function PdfIcon(
  props: PdfIconProps,
  ref
) {
  return (
    <Icon
      data-testid="PdfIcon"
      aria-label="pdf"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <>
        <path d="M8.707 0H1v6h1V1h5v3h3v2h1V2.293L8.707 0zM8 1h.293L10 2.707V3H8V1z" />
        <path d="M2.453 7.003c.645 0 1.115.132 1.412.396s.444.635.444 1.111c0 .216-.034.423-.103.619a1.302 1.302 0 0 1-.328.516 1.615 1.615 0 0 1-.605.352c-.248.087-.555.13-.919.13h-.533V12h-.82V7.003h1.453zm-.055.68H1.82v1.76h.448c.257 0 .476-.03.656-.089.18-.062.317-.158.41-.291s.14-.306.14-.523c0-.289-.088-.505-.263-.646-.173-.141-.444-.212-.813-.212z" />
        <path d="M8.77 9.454c0 .563-.105 1.033-.314 1.412-.21.376-.514.66-.913.851-.399.189-.88.284-1.442.284H4.713V7.004h1.538c.517 0 .964.093 1.34.28.376.185.667.459.872.824.205.362.308.811.308 1.347zm-.854.024c0-.41-.065-.747-.195-1.012a1.255 1.255 0 0 0-.567-.588c-.248-.13-.555-.195-.919-.195h-.701v3.63h.581c.604 0 1.055-.154 1.354-.461s.448-.766.448-1.374z" />
        <path d="M9.177 12h.813V9.939h1.88v-.687H9.99V7.693H12v-.69H9.177V12z" />
      </>
    </Icon>
  );
});
