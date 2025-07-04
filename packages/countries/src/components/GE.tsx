// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type GEProps = CountrySymbolProps;

const GE = forwardRef<SVGSVGElement, GEProps>(function GE(props: GEProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="GE"
      aria-label="Georgia"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-GE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-GE-a)`}>
        <path fill="#f5f7f8" d="M0 0h20v20H0z" />
        <path
          fill="#dd2033"
          d="M8.444 20h3.334v-8.333H20V8.333h-8.222V0H8.444v8.333H0v3.334h8.444z"
        />
        <path
          fill="#dd2033"
          d="M2.889 5.556V4.444h1.667V2.778h1.11v1.666h1.667v1.112H5.667v1.666H4.556V5.556zm10 0V4.444h1.667V2.778h1.11v1.666h1.667v1.112h-1.666v1.666h-1.111V5.556zm-10 10v-1.112h1.667v-1.666h1.11v1.666h1.667v1.112H5.667v1.666H4.556v-1.666zm10 0v-1.112h1.667v-1.666h1.11v1.666h1.667v1.112h-1.666v1.666h-1.111v-1.666z"
        />
      </g>
    </CountrySymbol>
  );
});

export default GE;
