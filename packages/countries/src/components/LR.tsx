// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type LRProps = CountrySymbolProps;

const LR = forwardRef<SVGSVGElement, LRProps>(function LR(props: LRProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="LR"
      aria-label="Liberia"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-LR-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-LR-a)`}>
        <path fill="#f5f7f8" d="M0 0h20v20H0z" />
        <path
          fill="#dd2033"
          d="M20 5V2.5H0V5zm0 2.5V10H0V7.5zm0 7.5v-2.5H0V15zm0 5v-2.5H0V20z"
        />
        <path fill="#004692" d="M.111 10V0h10v10z" />
        <path
          fill="#f5f7f8"
          d="M6.167 2.778 5.339 4.65l-1.95.249 1.438 1.407-.377 2.026 1.717-1.157 1.716 1.157-.377-2.026L8.944 4.9l-1.95-.25z"
        />
      </g>
    </CountrySymbol>
  );
});

export default LR;
