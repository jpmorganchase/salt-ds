// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type HNProps = CountrySymbolProps;

const HN = forwardRef<SVGSVGElement, HNProps>(function HN(props: HNProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="HN"
      aria-label="Honduras"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-HN-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-HN-a)`}>
        <path fill="#0091da" d="M0 0h20v20H0z" />
        <path fill="#f5f7f8" d="M0 15V5h20v10z" />
        <path
          fill="#0091da"
          d="m5.222 6.389-.497 1.124-1.17.15.863.843-.226 1.216 1.03-.694 1.03.694-.226-1.216.863-.844-1.17-.15zm4.722 3.889-.496 1.124-1.17.149.863.844-.227 1.216 1.03-.694 1.03.694-.226-1.216.863-.844-1.17-.15zm4.226-2.765.497-1.124.497 1.124 1.17.15-.864.843.227 1.216-1.03-.694-1.03.694.226-1.216L13 7.662z"
        />
      </g>
    </CountrySymbol>
  );
});

export default HN;
