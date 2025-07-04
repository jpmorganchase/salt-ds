// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type UY_SharpProps = CountrySymbolProps;

const UY_Sharp = forwardRef<SVGSVGElement, UY_SharpProps>(function UY_Sharp(
  props: UY_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="UY_Sharp"
      aria-label="Uruguay"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-UY-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-UY-a)`}>
        <path fill="#f5f7f8" d="M0 20V0h29v20z" />
        <path
          fill="#004692"
          d="M14.5 3.6V0H29v3.6zm0 7.2V7.2H29v3.6zM0 18v-3.6h29V18z"
        />
        <path
          fill="#f1b434"
          d="m11.68 7.2-1.81.889.964 1.83-1.966-.392L8.62 11.6l-1.37-1.525L5.88 11.6l-.248-2.073-1.966.392.964-1.83-1.81-.89 1.81-.888-.964-1.83 1.966.392L5.88 2.8l1.37 1.525L8.62 2.8l.248 2.073 1.966-.393-.964 1.83z"
        />
      </g>
    </CountrySymbol>
  );
});

export default UY_Sharp;
