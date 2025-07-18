// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type DK_SharpProps = CountrySymbolProps;

const DK_Sharp = forwardRef<SVGSVGElement, DK_SharpProps>(function DK_Sharp(
  props: DK_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="DK_Sharp"
      aria-label="Denmark"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-DK-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-DK-a)`}>
        <path fill="#dd2033" d="M0 0h29v20H0z" />
        <path
          fill="#f5f7f8"
          d="M5.639 24.4h5.639V12.8H29V7.2H11.278V-4.4h-5.64V7.2H0v5.6h5.639z"
        />
      </g>
    </CountrySymbol>
  );
});

export default DK_Sharp;
