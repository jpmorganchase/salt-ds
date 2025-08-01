// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type TJProps = CountrySymbolProps;

const TJ = forwardRef<SVGSVGElement, TJProps>(function TJ(props: TJProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="TJ"
      aria-label="Tajikistan"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-TJ-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-TJ-a)`}>
        <path fill="#008259" d="M0 20v-6.667h20V20z" />
        <path fill="#f5f7f8" d="M0 13.333V6.666h20v6.667z" />
        <path fill="#dd2033" d="M0 6.667V0h20v6.667z" />
        <path
          fill="#f1b434"
          d="m9.271 4.825.414-.936.414.936.975.125-.719.703.189 1.014-.859-.579-.858.579.188-1.014-.719-.703zm.84 3.508 1.429 1.429.793-.595 1.111.833-.325 1.667H7.103L6.778 10l1.11-.833.795.595zM4.87 5.529l.198 1.005-.727.66.992.164.427.939.371-.967 1.035-.018-.735-.722.185-.989-.87.458zM3.308 9.27l.414-.937.414.937.975.124-.719.704.189 1.013-.859-.579-.858.58.188-1.014-.719-.704zm12.636-.937-.414.937-.974.124.719.704-.189 1.013.858-.579.859.58-.189-1.014.72-.704-.976-.124zm-2.301-2.274.876-.53-.198 1.005.727.66-.992.164-.427.939-.371-.967-1.036-.018.736-.722-.185-.989z"
        />
      </g>
    </CountrySymbol>
  );
});

export default TJ;
