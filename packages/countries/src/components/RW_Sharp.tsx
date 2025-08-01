// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type RW_SharpProps = CountrySymbolProps;

const RW_Sharp = forwardRef<SVGSVGElement, RW_SharpProps>(function RW_Sharp(
  props: RW_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="RW_Sharp"
      aria-label="Rwanda"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-RW-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-RW-a)`}>
        <path fill="#005b33" d="M0 20v-4.8h29V20z" />
        <path fill="#0091da" d="M0 9.6V0h29v9.6z" />
        <path fill="#fbd381" d="M0 15.2V9.6h29v5.6z" />
      </g>
    </CountrySymbol>
  );
});

export default RW_Sharp;
