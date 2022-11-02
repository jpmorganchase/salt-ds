import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PdfSolidIconProps = IconProps;

export const PdfSolidIcon = forwardRef<SVGSVGElement, PdfSolidIconProps>(
  function PdfSolidIcon(props: PdfSolidIconProps, ref) {
    return (
      <Icon
        data-testid="PdfSolidIcon"
        aria-label="pdf solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.707 0H1v6h10V2.293L8.707 0ZM7 1h1v2h2v1H7V1Z"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.453 7.003c.644 0 1.115.132 1.411.396.296.265.445.635.445 1.111 0 .217-.035.423-.103.619a1.313 1.313 0 0 1-.328.516 1.608 1.608 0 0 1-.605.352c-.248.087-.555.13-.92.13H1.82V12H1V7.003h1.453Zm-.055.68H1.82v1.76h.448c.258 0 .476-.03.656-.089a.8.8 0 0 0 .41-.29c.094-.132.14-.307.14-.523 0-.29-.087-.505-.263-.646-.173-.141-.444-.212-.813-.212Z"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.77 9.454c0 .562-.105 1.033-.314 1.411-.21.376-.514.66-.913.851-.399.19-.88.284-1.442.284H4.713V7.003H6.25c.517 0 .964.093 1.34.28.376.185.666.46.871.824.205.362.308.811.308 1.347Zm-.854.024c0-.41-.065-.748-.195-1.012a1.247 1.247 0 0 0-.568-.588c-.248-.13-.555-.195-.92-.195h-.7v3.63h.581c.604 0 1.055-.154 1.354-.461.298-.308.448-.766.448-1.374Z"
          />
          <path d="M9.99 12h-.813V7.003H12v.69H9.99v1.559h1.88v.687H9.99V12Z" />
        </>
      </Icon>
    );
  }
);
