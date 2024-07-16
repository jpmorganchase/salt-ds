// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type GI_SharpProps = CountrySymbolProps;

const GI_Sharp = forwardRef<SVGSVGElement, GI_SharpProps>(function GI_Sharp(
  props: GI_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="GI_Sharp"
      aria-label="Gibraltar"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-GI-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-GI-a)`}>
        <path fill="#F5F7F8" d="M0 0h72v35H0z" />
        <path
          fill="#DD2033"
          d="M0 35h72v15H0zm21-25v4h2v-4h4v4h-2v4h5V7h-2V3h4v4h2V3h4v4h2V3h4v4h-2v11h5v-4h-2v-4h4v4h2v-4h4v4h-2v4h1v11H18V18h1v-4h-2v-4h4Z"
        />
        <path
          fill="#F1B434"
          fillRule="evenodd"
          d="M37.6 48h-3v-1.208h-5v-7h5v-5.05a6.5 6.5 0 1 1 3 .151V48Zm2.32-19.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default GI_Sharp;
