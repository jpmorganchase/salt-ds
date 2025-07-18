// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type SRProps = CountrySymbolProps;

const SR = forwardRef<SVGSVGElement, SRProps>(function SR(props: SRProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="SR"
      aria-label="Suriname"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-SR-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-SR-a)`}>
        <path fill="#005b33" d="M0 0h20v20H0z" />
        <path fill="#f5f7f8" d="M0 15.556V4.445h20v11.11z" />
        <path fill="#a00009" d="M0 13.889V6.11h20v7.778z" />
        <path
          fill="#fbd381"
          d="m10 6.667-.994 2.247-2.34.3L8.393 10.9l-.452 2.432L10 11.944l2.06 1.39-.452-2.433 1.725-1.688-2.34-.299z"
        />
      </g>
    </CountrySymbol>
  );
});

export default SR;
