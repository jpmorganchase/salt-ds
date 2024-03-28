// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BWProps = CountrySymbolProps;

const BW = forwardRef<SVGSVGElement, BWProps>(function BW(props: BWProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="BW"
      aria-label="Botswana"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-BW-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-BW-a)`}>
            <path fill="#86C5FA" d="M0 72V0h72v72z" />
            <path fill="#F5F7F8" d="M0 48V24h72v24z" />
            <path fill="#31373D" d="M0 42V30h72v12z" />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-BW-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-BW-a)`}>
            <path fill="#86C5FA" d="M0 50V0h72v50z" />
            <path fill="#F5F7F8" d="M0 37V13h72v24z" />
            <path fill="#31373D" d="M0 31V19h72v12z" />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default BW;
