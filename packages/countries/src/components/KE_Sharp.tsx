// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type KE_SharpProps = CountrySymbolProps;

const KE_Sharp = forwardRef<SVGSVGElement, KE_SharpProps>(function KE_Sharp(
  props: KE_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="KE_Sharp"
      aria-label="Kenya"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-KE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-KE-a)`}>
        <path fill="#f5f7f8" d="M0 16.4V3.6h29v12.8z" />
        <path fill="#dd2033" d="M0 14V6h29v8z" />
        <path fill="#31373d" d="M0 3.6V0h29v3.6z" />
        <path fill="#009b77" d="M0 20v-3.6h29V20z" />
        <path
          fill="#f5f7f8"
          d="m8.942 1.6 1.395-.8 4.337 7.46L19.011.8l1.396.8-4.803 8.26 4.802 8.26-1.395.8-4.337-7.46-4.337 7.46-1.395-.8 4.802-8.26z"
        />
        <path
          fill="#dd2033"
          d="M14.543 2.8c9.872 8.088 0 14.4 0 14.4s-10.065-6.115 0-14.4"
        />
        <mask
          id={`${uid}-KE-b`}
          x="10"
          y="2"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path
            fill="#dd2033"
            d="M14.543 2.8c9.872 8.088 0 14.4 0 14.4s-10.065-6.115 0-14.4"
          />
        </mask>
        <g mask={`url(#${uid}-KE-b)`}>
          <path
            fill="#31373d"
            stroke="#31373d"
            strokeWidth=".806"
            d="M10.472 3.203h.806v13.594h-.806zm7.25 0h.806v13.594h-.806z"
          />
          <path fill="#f5f7f8" d="M13.775 2.8h1.611v14.4h-1.611z" />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default KE_Sharp;
