// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type LVProps = CountrySymbolProps;

const LV = forwardRef<SVGSVGElement, LVProps>(function LV(props: LVProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="LV"
      aria-label="Latvia"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-LV-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-LV-a)`}>
            <path fill="#85001F" d="M0 0h72v72H0z" />
            <path fill="#F5F7F8" d="M0 45V27h72v18z" />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-LV-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-LV-a)`}>
            <path fill="#85001F" d="M0 0h72v50H0z" />
            <path fill="#F5F7F8" d="M0 32V18h72v14z" />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default LV;
