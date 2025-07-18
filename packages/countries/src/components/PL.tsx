// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type PLProps = CountrySymbolProps;

const PL = forwardRef<SVGSVGElement, PLProps>(function PL(props: PLProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="PL"
      aria-label="Poland"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-PL-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-PL-a)`}>
        <path fill="#dd2033" d="M0 0h20v20H0z" />
        <path fill="#f5f7f8" d="M0 0h20v10H0z" />
      </g>
    </CountrySymbol>
  );
});

export default PL;
