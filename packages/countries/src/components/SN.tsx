// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type SNProps = CountrySymbolProps;

const SN = forwardRef<SVGSVGElement, SNProps>(function SN(props: SNProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="SN"
      aria-label="Senegal"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-SN-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle
          cx="36"
          cy="36"
          r="36"
          fill="#D9D9D9"
          transform="matrix(0 -1 -1 0 72 72)"
        />
      </mask>
      <g mask={`url(#${uid}-SN-a)`}>
        <path fill="#005B33" d="M0 72h24V0H0z" />
        <path fill="#FBD381" d="M24 72h24V0H24z" />
        <path fill="#DD2033" d="M48 72h24V0H48z" />
        <path
          fill="#005B33"
          d="m36 26-2.98 6.742-7.02.897 5.177 5.064L29.82 46 36 41.833 42.18 46l-1.357-7.297L46 33.64l-7.02-.897L36 26Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default SN;
