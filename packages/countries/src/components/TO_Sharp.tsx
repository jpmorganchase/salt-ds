// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type TO_SharpProps = CountrySymbolProps;

const TO_Sharp = forwardRef<SVGSVGElement, TO_SharpProps>(function TO_Sharp(
  props: TO_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="TO_Sharp"
      aria-label="Tonga"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-TO-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-TO-a)`}>
        <path fill="#dd2033" d="M0 20V0h29v20z" />
        <path
          fill="#f5f7f8"
          fillRule="evenodd"
          d="M0 0v13.6h17.722V0zm7.653 2.8h2.416v2.8h2.82V8h-2.82v2.8H7.653V8h-2.82V5.6h2.82z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default TO_Sharp;
