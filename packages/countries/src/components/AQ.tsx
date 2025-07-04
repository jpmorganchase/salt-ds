// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type AQProps = CountrySymbolProps;

const AQ = forwardRef<SVGSVGElement, AQProps>(function AQ(props: AQProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="AQ"
      aria-label="Antarctica"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-AQ-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-AQ-a)`}>
        <path fill="#0091da" d="M0 0h20v20H0z" />
        <path
          fill="#f5f7f8"
          d="M7.038 8.129c-1.668.56-2.672-.934-3.058-1.448-.296.187-.278.732-.231.98l1.25 2.149c.112 1.905.912 3.004 1.298 3.315 1.408.636 3.181.545 3.892.42.556.374.231 1.121 0 1.448 4.448 1.457 5.312-3.035 5.189-5.463l-.834-.42c.222-1.084-.093-2.07-.278-2.429L9.494 5l-1.483.934c-.015.654-.231 2.008-.973 2.195"
        />
      </g>
    </CountrySymbol>
  );
});

export default AQ;
