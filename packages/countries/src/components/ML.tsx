// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type MLProps = CountrySymbolProps;

const ML = forwardRef<SVGSVGElement, MLProps>(function ML(props: MLProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="ML"
      aria-label="Mali"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-ML-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle
          cx="10"
          cy="10"
          r="10"
          fill="#d9d9d9"
          transform="matrix(0 -1 -1 0 20 20)"
        />
      </mask>
      <g mask={`url(#${uid}-ML-a)`}>
        <path fill="#009b77" d="M0 20h6.667V0H0z" />
        <path fill="#fbd381" d="M6.667 20h6.667V0H6.667z" />
        <path fill="#dd2033" d="M13.333 20H20V0h-6.667z" />
      </g>
    </CountrySymbol>
  );
});

export default ML;
