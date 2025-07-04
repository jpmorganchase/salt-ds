// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type KN_SharpProps = CountrySymbolProps;

const KN_Sharp = forwardRef<SVGSVGElement, KN_SharpProps>(function KN_Sharp(
  props: KN_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="KN_Sharp"
      aria-label="Saint Kitts and Nevis"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-KN-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-KN-a)`}>
        <path fill="#009b77" d="M0 0h29v20H0z" />
        <path fill="#dd2033" d="M29 24.4H0L29-4.4z" />
        <path
          fill="#fbd381"
          d="m-2.461 18.193 9.114 9.052L32.167 1.907l-9.114-9.052z"
        />
        <path
          fill="#31373d"
          d="m4.738 25.68-5.696-5.658L25.176-5.93l5.696 5.657z"
        />
        <path
          fill="#f5f7f8"
          d="m6.79 13.508.857 2.2-1.395 1.791 2.333-.025 1.353 1.958.46-2.341 2.357-.456-1.972-1.344.026-2.317-1.804 1.385zM18.113 2.263l.857 2.2-1.395 1.791 2.334-.026 1.353 1.959.458-2.342 2.358-.455-1.972-1.344.026-2.317-1.804 1.385z"
        />
      </g>
    </CountrySymbol>
  );
});

export default KN_Sharp;
