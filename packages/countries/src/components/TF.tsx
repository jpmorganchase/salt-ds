// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type TFProps = CountrySymbolProps;

const TF = forwardRef<SVGSVGElement, TFProps>(function TF(props: TFProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="TF"
      aria-label="French Southern Territories (the)"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-TF-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-TF-a)`}>
        <path fill="#004692" d="M0 0h20v20H0z" />
        <path fill="#f5f7f8" d="M0 0h10.556v10.556H0z" />
        <path fill="#004692" d="M0 10h3.333V0H0z" />
        <path fill="#dd2033" d="M6.667 10H10V0H6.667z" />
        <path
          fill="#f5f7f8"
          d="m10.556 12.222-.497 1.124-1.17.15.863.843-.227 1.217 1.03-.695 1.03.694-.226-1.216.863-.844-1.17-.15z"
        />
        <path
          fill="#f5f7f8"
          fillRule="evenodd"
          d="m12.434 12.222.657 1.068h1.876v3.724l-1.407-2.24-1.893 3.073h.92l.187-.338h1.57l.713 1.302h.998l.712-1.302h1.57l.186.338h.921l-1.893-3.073-1.407 2.24v-2.057h.844l.627-1.016h-1.471v-.651h1.876l.657-1.068zm1.51 4.557-.384-.703-.386.703zm3.993 0h-.77l.384-.703z"
          clipRule="evenodd"
        />
        <path
          fill="#f5f7f8"
          d="m11.725 19.735.497-1.124.497 1.124 1.17.15-.863.843.226 1.216-1.03-.694-1.03.694.226-1.216-.862-.844z"
        />
      </g>
    </CountrySymbol>
  );
});

export default TF;
