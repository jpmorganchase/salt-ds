// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type BEProps = CountrySymbolProps;

const BE = forwardRef<SVGSVGElement, BEProps>(function BE(props: BEProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="BE"
      aria-label="Belgium"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-BE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-BE-a)`}>
        <path fill="#31373d" d="M0 0h6.667v20H0z" />
        <path fill="#f1b434" d="M6.667 0h6.667v20H6.667z" />
        <path fill="#dd2033" d="M13.333 0H20v20h-6.667z" />
      </g>
    </CountrySymbol>
  );
});

export default BE;
