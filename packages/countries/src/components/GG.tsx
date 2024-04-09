// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GGProps = CountrySymbolProps;

const GG = forwardRef<SVGSVGElement, GGProps>(function GG(props: GGProps, ref) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "50%",
    "--saltCountrySymbol-aspect-ratio-multiplier": "1",
  };

  return (
    <CountrySymbol
      data-testid="GG"
      style={style}
      aria-label="Guernsey"
      viewBox="0 0 72 72"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-GG-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-GG-a)`}>
        <path fill="#F5F7F8" d="M0 0h72v72H0z" />
        <path fill="#DD2033" d="M24 72h24V48h24V24H48V0H24v24H0v24h24v24Z" />
        <path fill="#F1B434" d="M41 11H31v20H11v10h20v20h10V41h20V31H41V11Z" />
      </g>
    </CountrySymbol>
  );
});

export default GG;
