// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type DKProps = CountrySymbolProps;

const DK = forwardRef<SVGSVGElement, DKProps>(function DK(props: DKProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="DK"
      aria-label="Denmark"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-DK-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-DK-a)`}>
        <path fill="#dd2033" d="M0 0h20v20H0z" />
        <path
          fill="#f5f7f8"
          d="M3.889 20h3.889v-8.056H20V8.056H7.778V0h-3.89v8.056H0v3.888h3.889z"
        />
      </g>
    </CountrySymbol>
  );
});

export default DK;
