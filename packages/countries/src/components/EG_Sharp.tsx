// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type EG_SharpProps = CountrySymbolProps;

const EG_Sharp = forwardRef<SVGSVGElement, EG_SharpProps>(function EG_Sharp(
  props: EG_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="EG_Sharp"
      aria-label="Egypt"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-EG-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-EG-a)`}>
        <path fill="#31373d" stroke="#31373d" d="M.5 19.5v-5.4h28v5.4z" />
        <path fill="#f5f7f8" d="M0 13.6V6.4h29v7.2z" />
        <path fill="#dd2033" d="M0 6.4V0h29v6.4z" />
        <path
          fill="#f1b434"
          d="M12.486 2h1.611a2.41 2.41 0 0 1 2.417 2.4v2.033A2.406 2.406 0 0 1 18.528 8.8v7.6l-3.43-1.362a1.62 1.62 0 0 0-1.196 0l-3.43 1.362V8.8c0-1.19.871-2.176 2.014-2.367z"
        />
        <path
          fill="#f1b434"
          d="M13.614 16.205 11.278 17.8h6.646l-2.522-1.62a1.62 1.62 0 0 0-1.788.025"
        />
      </g>
    </CountrySymbol>
  );
});

export default EG_Sharp;
