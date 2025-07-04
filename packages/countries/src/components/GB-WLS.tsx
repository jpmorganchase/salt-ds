// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type GB_WLSProps = CountrySymbolProps;

const GB_WLS = forwardRef<SVGSVGElement, GB_WLSProps>(function GB_WLS(
  props: GB_WLSProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="GB_WLS"
      aria-label="Wales"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-GB-WLS-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-GB-WLS-a)`}>
        <path fill="#f5f7f8" d="M0 0h20v10H0z" />
        <path fill="#009b77" d="M0 10h20v10H0z" />
        <path
          fill="#dd2033"
          d="m12.417 5.556-3.71 2.902-.42 1.138-.45-2.091c0-.24-.064-.465-.174-.66.258-.237.45-.541.529-.838-.327 0-.689.17-.985.364A1.338 1.338 0 0 0 5.16 7.507h1.124l-.26.897a2.9 2.9 0 0 0 .237 2.213l-.698.695-.853-.848V9.277l-.654-.651-.5.503.445.443v.892l-.445.443.5.503.3-.298 1.207 1.2 1.116-1.11q.116.128.245.24L5.738 13.38H4.647v.71H6.84v-.71h-.27l.801-1.31-.018.049.347-.195c.346.146.73.227 1.137.227l-.001-.006.926.514-.479.782H8.192v.71h2.193v-.71h-.27l.992-1.62-.001-.002.424-.28 2.047.541-.843 1.377h-1.091v.71h2.193v-.71h-.27l.956-1.562.007-.002-.004-.004.033-.053-.238-.145-.742-.717c.496-.228 1.37-.814 1.804-1.658l.798.46V7.611l-1.875 1.083.672.388a4 4 0 0 1-2.119.821l.817-.639V5.556l-1.258.984z"
        />
      </g>
    </CountrySymbol>
  );
});

export default GB_WLS;
