// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type GF_SharpProps = CountrySymbolProps;

const GF_Sharp = forwardRef<SVGSVGElement, GF_SharpProps>(function GF_Sharp(
  props: GF_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="GF_Sharp"
      aria-label="French Guiana"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-GF-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-GF-a)`}>
        <path fill="#fbd381" d="M0 20h29V0H0z" />
        <path fill="#009b77" d="M29-4.4v28.8L0-4.4z" />
        <path
          fill="#dd2033"
          d="m14.5 5.2-1.44 3.236-3.393.43 2.502 2.432-.656 3.502 2.987-2 2.987 2-.656-3.502 2.502-2.431-3.392-.43z"
        />
      </g>
    </CountrySymbol>
  );
});

export default GF_Sharp;
