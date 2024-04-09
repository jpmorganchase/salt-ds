// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type TTProps = CountrySymbolProps;

const TT = forwardRef<SVGSVGElement, TTProps>(function TT(props: TTProps, ref) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "50%",
    "--saltCountrySymbol-aspect-ratio-multiplier": "1",
  };

  return (
    <CountrySymbol
      data-testid="TT"
      style={style}
      aria-label="Trinidad and Tobago"
      viewBox="0 0 72 72"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-TT-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-TT-a)`}>
        <path fill="#DD2033" d="M0 0h72v72H0z" />
        <path
          fill="#F5F7F8"
          d="M-.062 21.15 21.15-.062 72.063 50.85 50.85 72.062z"
        />
        <path
          fill="#31373D"
          d="M16.908 4.18 4.18 16.908 55.092 67.82 67.82 55.092z"
        />
      </g>
    </CountrySymbol>
  );
});

export default TT;
