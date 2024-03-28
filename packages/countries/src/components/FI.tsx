// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type FIProps = CountrySymbolProps;

const FI = forwardRef<SVGSVGElement, FIProps>(function FI(props: FIProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="FI"
      aria-label="Finland"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-FI-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-FI-a)`}>
            <path fill="#F5F7F8" d="M0 0h72v72H0z" />
            <path
              fill="#005EB8"
              d="M14 72h14V43h44V29H28V0H14v29H0v14h14v29Z"
            />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-FI-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-FI-a)`}>
            <path fill="#F5F7F8" d="M0 0h72v50H0z" />
            <path
              fill="#005EB8"
              d="M14 50h14V32h44V18H28V0H14v18H0v14h14v18Z"
            />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default FI;
