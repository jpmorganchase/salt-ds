// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type BDProps = CountrySymbolProps;

const BD = forwardRef<SVGSVGElement, BDProps>(function BD(props: BDProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="BD"
      aria-label="Bangladesh"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-BD-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle
          cx="36"
          cy="36"
          r="36"
          fill="#D9D9D9"
          transform="rotate(-90 36 36)"
        />
      </mask>
      <g mask={`url(#${uid}-BD-a)`}>
        <path fill="#005B33" d="M72 72H0V0h72z" />
        <circle cx="30" cy="36" r="16" fill="#DD2033" />
      </g>
    </CountrySymbol>
  );
});

export default BD;
