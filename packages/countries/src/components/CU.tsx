// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CUProps = CountrySymbolProps;

const CU = forwardRef<SVGSVGElement, CUProps>(function CU(props: CUProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="CU"
      aria-label="Cuba"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-CU-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-CU-a)`}>
            <path fill="#005EB8" d="M0 0h72v72H0z" />
            <path fill="#F5F7F8" d="M0 28V14h72v14zm0 30V44h72v14z" />
            <path fill="#DD2033" d="M48 36 0 0v72l48-36Z" />
            <path
              fill="#F5F7F8"
              d="m21 27-2.683 6.068-6.317.807 4.66 4.558L15.438 45 21 41.25 26.562 45l-1.222-6.567L30 33.875l-6.317-.807L21 27Z"
            />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-CU-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-CU-a)`}>
            <path fill="#005EB8" d="M0 0h72v50H0z" />
            <path fill="#F5F7F8" d="M0 20V10h72v10zm0 20V30h72v10z" />
            <path fill="#DD2033" d="M40 25-8-11v72l48-36Z" />
            <path
              fill="#F5F7F8"
              d="m15 16-2.683 6.068L6 22.875l4.66 4.558L9.438 34 15 30.25 20.562 34l-1.222-6.567L24 22.875l-6.317-.807L15 16Z"
            />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default CU;
