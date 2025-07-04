// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type LIProps = CountrySymbolProps;

const LI = forwardRef<SVGSVGElement, LIProps>(function LI(props: LIProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="LI"
      aria-label="Liechtenstein"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-LI-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-LI-a)`}>
        <path fill="#dd2033" d="M-.111 20V10h20v10z" />
        <path fill="#004692" d="M-.111 10V0h20v10z" />
        <path
          fill="#f1b434"
          fillRule="evenodd"
          d="M6.778 2.222h.833v.556h.833v.833h-.833v.779a1.667 1.667 0 0 1 1.944 2.686v.702H4.834v-.702A1.667 1.667 0 0 1 6.777 4.39v-.78h-.833v-.833h.834zm.416 2.509-.007-.009h.015zm-.007 2.213.007-.008.008.008z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default LI;
