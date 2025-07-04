// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type EHProps = CountrySymbolProps;

const EH = forwardRef<SVGSVGElement, EHProps>(function EH(props: EHProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="EH"
      aria-label="Western Sahara"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-EH-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-EH-a)`}>
        <path fill="#005b33" d="M0 20v-6.11h20V20z" />
        <path fill="#f5f7f8" d="M0 13.889V6.11h20v7.778z" />
        <path fill="#31373d" d="M0 6.111V.001h20v6.11z" />
        <path
          fill="#dd2033"
          d="M0 2.5v15h.556L3.889 15l6.667-5-6.667-5L.556 2.5zM12.778 10c0-1.035.708-1.906 1.666-2.152A2.226 2.226 0 0 0 11.667 10a2.222 2.222 0 0 0 2.777 2.152A2.22 2.22 0 0 1 12.778 10"
        />
        <path
          fill="#dd2033"
          d="m15.614 9.457.497-1.124.497 1.124 1.17.15-.863.844.226 1.216-1.03-.695-1.03.695.226-1.216-.863-.844z"
        />
      </g>
    </CountrySymbol>
  );
});

export default EH;
