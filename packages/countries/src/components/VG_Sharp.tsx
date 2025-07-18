// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type VG_SharpProps = CountrySymbolProps;

const VG_Sharp = forwardRef<SVGSVGElement, VG_SharpProps>(function VG_Sharp(
  props: VG_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="VG_Sharp"
      aria-label="Virgin Islands (British)"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-VG-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-VG-a)`}>
        <path fill="#004692" d="M0 0h29v20H0z" />
        <mask
          id={`${uid}-VG-b`}
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#002f6c" d="M0 12V0h14.5v12z" />
        </mask>
        <g mask={`url(#${uid}-VG-b)`}>
          <path fill="#004692" d="M0 0h14.5v14.4H0z" />
          <path
            fill="#f5f7f8"
            d="m5.152.402-.855.849L14.85 11.73l.854-.849zM2.873 2.665 1.45 4.079l10.552 10.479 1.424-1.414z"
          />
          <path
            fill="#dd2033"
            d="M2.873 2.665 4.297 1.25 14.85 11.73l-1.424 1.414z"
          />
          <path fill="#f5f7f8" d="M2.417 14h1.611V3.6H14.5V2H2.417z" />
          <path fill="#dd2033" d="M0 14h2.417V2h12.084V0H0z" />
        </g>
        <path fill="#fbd381" d="M26.18 14h-8.458v2h1.209v1.2h6.041V16h1.209z" />
        <path
          fill="#008259"
          d="M17.722 6.8h8.459v2.98A6.69 6.69 0 0 1 21.95 16a6.69 6.69 0 0 1-4.229-6.22z"
        />
        <path fill="#f5f7f8" d="M20.945 8.4h2.014v6h-2.014z" />
        <path
          fill="#f1b434"
          d="M19.132 8.8a.6.6 0 0 0 .604-.6c0-.332-.27-.6-.604-.6a.6.6 0 0 0-.604.6c0 .331.27.6.604.6m5.638 0a.6.6 0 0 0 .605-.6c0-.332-.27-.6-.604-.6a.6.6 0 0 0-.604.6c0 .331.27.6.604.6m.604 1.4c0 .331-.27.6-.604.6a.6.6 0 0 1-.604-.6c0-.332.27-.6.604-.6s.604.268.604.6m-6.243.6a.6.6 0 0 0 .604-.6c0-.332-.27-.6-.604-.6a.6.6 0 0 0-.604.6c0 .331.27.6.604.6m6.243 1.4c0 .331-.27.6-.604.6a.6.6 0 0 1-.604-.6c0-.332.27-.6.604-.6s.604.268.604.6m-6.243.6a.6.6 0 0 0 .604-.6c0-.332-.27-.6-.604-.6a.6.6 0 0 0-.604.6c0 .331.27.6.604.6"
        />
      </g>
    </CountrySymbol>
  );
});

export default VG_Sharp;
