// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type BJ_SharpProps = CountrySymbolProps;

const BJ_Sharp = forwardRef<SVGSVGElement, BJ_SharpProps>(function BJ_Sharp(
  props: BJ_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="BJ_Sharp"
      aria-label="Benin"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-BJ-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-BJ-a)`}>
        <path fill="#dd2033" d="M0 20V10h29v10z" />
        <path fill="#fbd381" d="M0 10V0h29v10z" />
        <path fill="#009b77" d="M0 0h9.667v20H0z" />
      </g>
    </CountrySymbol>
  );
});

export default BJ_Sharp;
