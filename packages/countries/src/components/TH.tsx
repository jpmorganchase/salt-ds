// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type THProps = CountrySymbolProps;

const TH = forwardRef<SVGSVGElement, THProps>(function TH(props: THProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="TH"
      aria-label="Thailand"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-TH-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-TH-a)`}>
        <path fill="#A00009" d="M0 72V0h72v72z" />
        <path fill="#F5F7F8" d="M0 58V14h72v44z" />
        <path fill="#004692" d="M0 46V26h72v20z" />
      </g>
    </CountrySymbol>
  );
});

export default TH;
