// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type FI_SharpProps = CountrySymbolProps;

const FI_Sharp = forwardRef<SVGSVGElement, FI_SharpProps>(function FI_Sharp(
  props: FI_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="FI_Sharp"
      aria-label="Finland"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-FI-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-FI-a)`}>
        <path fill="#f5f7f8" d="M0 0h29v20H0z" />
        <path
          fill="#005eb8"
          d="M5.639 20h5.639v-7.2H29V7.2H11.278V0h-5.64v7.2H0v5.6h5.639z"
        />
      </g>
    </CountrySymbol>
  );
});

export default FI_Sharp;
