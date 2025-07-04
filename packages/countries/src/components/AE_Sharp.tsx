// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type AE_SharpProps = CountrySymbolProps;

const AE_Sharp = forwardRef<SVGSVGElement, AE_SharpProps>(function AE_Sharp(
  props: AE_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="AE_Sharp"
      aria-label="United Arab Emirates (the)"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-AE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-AE-a)`}>
        <path fill="#31373d" d="M9.667 20v-6.4H29V20z" />
        <path fill="#f5f7f8" d="M9.667 13.6V6.4H29v7.2z" />
        <path fill="#005b33" d="M9.667 6.4V0H29v6.4z" />
        <path fill="#dd2033" d="M0 0h9.667v20H0z" />
      </g>
    </CountrySymbol>
  );
});

export default AE_Sharp;
