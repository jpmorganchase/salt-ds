// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type MMProps = CountrySymbolProps;

const MM = forwardRef<SVGSVGElement, MMProps>(function MM(props: MMProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="MM"
      aria-label="Myanmar"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-MM-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-MM-a)`}>
        <path fill="#dd2033" d="M0 20v-6.667h20V20z" />
        <path fill="#009b77" d="M0 13.333V6.666h20v6.667z" />
        <path fill="#fbd381" d="M0 6.667V0h20v6.667z" />
        <path
          fill="#f5f7f8"
          d="M10 5 8.51 8.371 5 8.82l2.589 2.532L6.909 15 10 12.917 13.09 15l-.679-3.648L15 8.82l-3.51-.449z"
        />
      </g>
    </CountrySymbol>
  );
});

export default MM;
