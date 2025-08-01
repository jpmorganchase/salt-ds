// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type CMProps = CountrySymbolProps;

const CM = forwardRef<SVGSVGElement, CMProps>(function CM(props: CMProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="CM"
      aria-label="Cameroon"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-CM-a`}
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
          transform="rotate(90 10 10)"
        />
      </mask>
      <g mask={`url(#${uid}-CM-a)`}>
        <path fill="#fbd381" d="M0 0h20v20H0z" />
        <path fill="#005b33" d="M0 0h6.389v20H0z" />
        <path
          fill="#dd2033"
          fillRule="evenodd"
          d="M13.611 0H6.39v20h7.222zM9.255 9.186 10 7.5l.745 1.686 1.755.224-1.294 1.266.34 1.824L10 11.458 8.455 12.5l.34-1.824L7.5 9.41z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default CM;
