// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type SY_SharpProps = CountrySymbolProps;

const SY_Sharp = forwardRef<SVGSVGElement, SY_SharpProps>(function SY_Sharp(
  props: SY_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="SY_Sharp"
      aria-label="Syrian Arab Republic (the)"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-SY-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-SY-a)`}>
        <path fill="#31373d" d="M0 20v-6h29v6z" />
        <path fill="#f5f7f8" d="M0 14V6h29v8z" />
        <path
          fill="#009b77"
          d="M6.53 9.218 7.25 7.6l.72 1.618 1.697.216-1.252 1.215.329 1.751-1.494-1-1.494 1 .328-1.751-1.25-1.215zm14.5 0 .72-1.618.72 1.618 1.697.216-1.251 1.215.328 1.751-1.494-1-1.494 1 .328-1.751-1.25-1.215z"
        />
        <path fill="#dd2033" d="M0 6V0h29v6z" />
      </g>
    </CountrySymbol>
  );
});

export default SY_Sharp;
