// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type SI_SharpProps = CountrySymbolProps;

const SI_Sharp = forwardRef<SVGSVGElement, SI_SharpProps>(function SI_Sharp(
  props: SI_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="SI_Sharp"
      aria-label="Slovenia"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-SI-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-SI-a)`}>
        <path fill="#dd2033" d="M0 20v-6.4h29V20z" />
        <path fill="#005eb8" d="M0 13.6V6.4h29v7.2z" />
        <path fill="#f5f7f8" d="M0 6.4V0h29v6.4z" />
        <path
          fill="#005eb8"
          d="M6.042 1.6h8.055v2.866A6.385 6.385 0 0 1 10.07 10.4a6.385 6.385 0 0 1-4.028-5.934z"
        />
        <mask
          id={`${uid}-SI-b`}
          x="6"
          y="1"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path
            fill="#2f80ed"
            d="M6.042 1.6h8.055v2.866A6.385 6.385 0 0 1 10.07 10.4a6.385 6.385 0 0 1-4.028-5.934z"
          />
        </mask>
        <g mask={`url(#${uid}-SI-b)`}>
          <path
            fill="#f5f7f8"
            d="M11.704 5.872 10.15 3.6 8.596 5.872l-.46-.672-3.488 5.1h4.616v.1h2.014v-.1h4.374l-3.488-5.1z"
          />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default SI_Sharp;
