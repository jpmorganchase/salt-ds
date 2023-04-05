// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef, useState } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type KEProps = CountrySymbolProps;

const KE = forwardRef<SVGSVGElement, KEProps>(function KE(props: KEProps, ref) {
  const [uid] = useState(() => props.id || Math.random().toString());

  return (
    <CountrySymbol
      data-testid="KE"
      aria-label="Kenya"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-KE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-KE-a)`}>
        <path fill="#F5F7F8" d="M0 52V20h72v32z" />
        <path fill="#DD2033" d="M0 46V26h72v20z" />
        <path fill="#31373D" d="M0 20V0h72v20z" />
        <path fill="#009B77" d="M0 72V52h72v20z" />
        <path
          fill="#F5F7F8"
          d="m22.2 15 3.464-2 10.768 18.65L47.2 13l3.464 2-11.922 20.65 11.922 20.651-3.464 2-10.768-18.65L25.664 58.3l-3.464-2 11.923-20.65L22.2 15Z"
        />
        <path
          fill="#DD2033"
          d="M36.107 18c24.51 20.22 0 36 0 36s-24.99-15.288 0-36Z"
        />
        <mask
          id={`${uid}-KE-b`}
          x="25"
          y="18"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path
            fill="#DD2033"
            d="M36.107 18c24.51 20.22 0 36 0 36s-24.99-15.288 0-36Z"
          />
        </mask>
        <g mask={`url(#${uid}-KE-b)`}>
          <path fill="#31373D" d="M25 18h4v36h-4zm18 0h4v36h-4z" />
          <path fill="#F5F7F8" d="M34.2 18h4v36h-4z" />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default KE;
