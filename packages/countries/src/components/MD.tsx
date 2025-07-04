// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type MDProps = CountrySymbolProps;

const MD = forwardRef<SVGSVGElement, MDProps>(function MD(props: MDProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="MD"
      aria-label="Moldova (the Republic of)"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-MD-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-MD-a)`}>
        <path fill="#dd2033" d="M20 20h-4.444V0H20z" />
        <path fill="#f1b434" d="M15.555 20H4.445V0h11.11z" />
        <path fill="#004692" d="M4.445 20H0V0h4.444z" />
        <path
          fill="#936846"
          d="M6.857 6.461c.47-.032 1.159.038 1.695.304.483.24.82.617.82 1.32v2.677l-3.15 3.123 1.157 1.148 2.043-2.026-.862 2.138 1.636 1.622 1.636-1.622-.865-2.144 2.04 2.022 1.156-1.147-3.15-3.123V8.077h-.005c-.003-1.423-.795-2.3-1.722-2.761-.876-.437-1.881-.518-2.542-.473z"
        />
        <path
          fill="#936846"
          d="M5.944 7.222v5.556l1.945-1.389V8.333a1.11 1.11 0 0 0-1.111-1.11zm8.334 5.556V7.222h-.834a1.11 1.11 0 0 0-1.11 1.111v3.056z"
        />
        <path
          fill="#dd2033"
          d="M7.278 7.729h5.555v2.008a4.42 4.42 0 0 1-2.777 4.103 4.42 4.42 0 0 1-2.778-4.103z"
        />
        <mask
          id={`${uid}-MD-b`}
          x="7"
          y="7"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path
            fill="#005eb8"
            d="M7.278 7.729h5.555v2.008a4.42 4.42 0 0 1-2.777 4.103 4.42 4.42 0 0 1-2.778-4.103z"
          />
        </mask>
        <g mask={`url(#${uid}-MD-b)`}>
          <path fill="#0091da" d="M7.278 10.556h5.555v3.333H7.278z" />
          <path
            fill="#f1b434"
            d="M10.667 10.407a1.11 1.11 0 0 0 .23-1.748l-.225.224a.79.79 0 0 1-.005 1.128v-.289H9.556v.29a.79.79 0 0 1-.006-1.129l-.225-.224a1.11 1.11 0 0 0 .23 1.748v1.538a.556.556 0 0 0 1.112 0zm-.556-2.073h.005-.01z"
          />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default MD;
