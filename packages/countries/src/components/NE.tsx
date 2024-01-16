// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef, useState } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type NEProps = CountrySymbolProps;

const NE = forwardRef<SVGSVGElement, NEProps>(function NE(props: NEProps, ref) {
  const [uid] = useState(useId(props.id));

  return (
    <CountrySymbol
      data-testid="NE"
      aria-label="Niger (the)"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-NE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-NE-a)`}>
        <path fill="#009B77" d="M0 72V48h72v24z" />
        <path fill="#F5F7F8" d="M0 48V24h72v24z" />
        <path fill="#FF9E42" d="M0 24V0h72v24z" />
        <circle cx="36" cy="36" r="9" fill="#FF9E42" />
      </g>
    </CountrySymbol>
  );
});

export default NE;
