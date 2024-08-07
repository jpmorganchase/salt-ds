// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type LUProps = CountrySymbolProps;

const LU = forwardRef<SVGSVGElement, LUProps>(function LU(props: LUProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="LU"
      aria-label="Luxembourg"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-LU-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-LU-a)`}>
        <path fill="#0091DA" d="M0 72V48h72v24z" />
        <path fill="#F5F7F8" d="M0 48V24h72v24z" />
        <path fill="#DD2033" d="M0 24V0h72v24z" />
      </g>
    </CountrySymbol>
  );
});

export default LU;
