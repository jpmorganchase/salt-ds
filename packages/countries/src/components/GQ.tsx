// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type GQProps = CountrySymbolProps;

const GQ = forwardRef<SVGSVGElement, GQProps>(function GQ(props: GQProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="GQ"
      aria-label="Equatorial Guinea"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-GQ-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-GQ-a)`}>
        <path fill="#dd2033" d="M0 20v-6.11h20V20z" />
        <path fill="#f5f7f8" d="M0 13.889V6.11h20v7.778z" />
        <path fill="#008259" d="M0 6.111V.001h20v6.11z" />
        <path fill="#0091da" d="M7.778 10 0 0v20z" />
        <path
          fill="#c1c3c3"
          d="M10 6.944h5.556v2.009c0 1.807-1.1 3.432-2.778 4.103A4.42 4.42 0 0 1 10 8.953z"
        />
        <path fill="#936846" d="M12.222 10h1.111v1.667h-1.111z" />
        <path
          fill="#009b77"
          d="M13.889 8.889a1.111 1.111 0 1 0-2.222 0 .556.556 0 0 0 0 1.111h2.222a.556.556 0 0 0 0-1.111"
        />
      </g>
    </CountrySymbol>
  );
});

export default GQ;
