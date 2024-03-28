// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type NCProps = CountrySymbolProps;

const NC = forwardRef<SVGSVGElement, NCProps>(function NC(props: NCProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="NC"
      aria-label="New Caledonia"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-NC-a`}
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
              transform="matrix(1 0 0 -1 0 72)"
            />
          </mask>
          <g mask={`url(#${uid}-NC-a)`}>
            <path fill="#004692" d="M0 72h24V0H0z" />
            <path fill="#F5F7F8" d="M24 72h24V0H24z" />
            <path fill="#DD2033" d="M48 72h24V0H48z" />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-NC-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-NC-a)`}>
            <path fill="#004692" d="M0 50h24V0H0z" />
            <path fill="#F5F7F8" d="M24 50h24V0H24z" />
            <path fill="#DD2033" d="M48 50h24V0H48z" />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default NC;
