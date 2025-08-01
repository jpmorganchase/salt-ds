// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type JM_SharpProps = CountrySymbolProps;

const JM_Sharp = forwardRef<SVGSVGElement, JM_SharpProps>(function JM_Sharp(
  props: JM_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="JM_Sharp"
      aria-label="Jamaica"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-JM-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-JM-a)`}>
        <path fill="#31373d" d="M0 0h29v20H0z" />
        <path
          fill="#009b77"
          d="M0 24.4 14.097 10 0-4.4h29L14.097 10 29 24.4z"
        />
        <path
          fill="#f1b434"
          d="M26.37 22.4 29 20.151 17.13 10 29-.151 26.37-2.4 14.5 7.751 2.63-2.4 0-.151 11.87 10 0 20.151 2.63 22.4 14.5 12.249z"
        />
      </g>
    </CountrySymbol>
  );
});

export default JM_Sharp;
