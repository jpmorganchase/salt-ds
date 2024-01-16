// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef, useState } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type RUProps = CountrySymbolProps;

const RU = forwardRef<SVGSVGElement, RUProps>(function RU(props: RUProps, ref) {
  const [uid] = useState(useId(props.id));

  return (
    <CountrySymbol
      data-testid="RU"
      aria-label="Russian Federation (the)"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-RU-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-RU-a)`}>
        <path fill="#DD2033" d="M0 72V48h72v24z" />
        <path fill="#004692" d="M0 48V24h72v24z" />
        <path fill="#F5F7F8" d="M0 24V0h72v24z" />
      </g>
    </CountrySymbol>
  );
});

export default RU;
