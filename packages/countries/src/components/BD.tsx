// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BDProps = CountrySymbolProps;

const BD = forwardRef<SVGSVGElement, BDProps>(function BD(props: BDProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="BD"
      aria-label="Bangladesh"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
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
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-BD-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-BD-a)`}>
            <path fill="#005B33" d="M72 50H0V0h72z" />
            <circle cx="30" cy="25" r="16" fill="#DD2033" />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default BD;
