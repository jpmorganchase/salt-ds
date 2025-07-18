// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type CK_SharpProps = CountrySymbolProps;

const CK_Sharp = forwardRef<SVGSVGElement, CK_SharpProps>(function CK_Sharp(
  props: CK_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="CK_Sharp"
      aria-label="Cook Islands (the)"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-CK-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-CK-a)`}>
        <path fill="#004692" d="M0 0h29v20H0z" />
        <mask
          id={`${uid}-CK-b`}
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#002f6c" d="M0 12V0h14.5v12z" />
        </mask>
        <g mask={`url(#${uid}-CK-b)`}>
          <path
            fill="#f5f7f8"
            d="m5.152.402-.855.848L14.85 11.73l.854-.85zM2.873 2.665 1.45 4.079l10.552 10.479 1.424-1.415z"
          />
          <path
            fill="#dd2033"
            d="M2.873 2.665 4.297 1.25 14.85 11.73l-1.424 1.413z"
          />
          <path fill="#f5f7f8" d="M2.417 14h1.611V3.6H14.5V2H2.417z" />
          <path fill="#dd2033" d="M0 14h2.417V2h12.084V0H0z" />
        </g>
        <path
          fill="#f5f7f8"
          d="m17.343 11.577-.367.825-.865.11.638.619-.167.892.76-.51.762.51-.167-.892.638-.62-.865-.11zm.924-2.27.367-.825.367.825.864.11-.637.619.167.893-.761-.51-.762.51.168-.893-.638-.62zm3.116-1.282.367-.825.367.825.865.11-.638.619.167.893-.76-.51-.762.51.167-.893-.638-.62zm-3.116 7.471.367-.825.367.825.864.11-.637.62.167.892-.761-.51-.762.51.168-.892-.638-.62zm3.483.457-.367.825-.865.11.638.62-.167.892.761-.51.761.51-.167-.893.638-.62-.865-.109zm2.75-.457.366-.825.367.825.865.11-.638.62.168.892-.762-.51-.761.51.167-.892-.637-.62zm1.657-3.919-.367.825-.865.11.638.619-.167.892.761-.51.761.51-.167-.892.638-.62-.865-.11zM24.5 9.307l.366-.825.367.825.865.11-.638.619.168.893-.762-.51-.761.51.167-.893-.637-.62z"
        />
      </g>
    </CountrySymbol>
  );
});

export default CK_Sharp;
