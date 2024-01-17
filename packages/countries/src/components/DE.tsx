// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef, useState } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type DEProps = CountrySymbolProps;

const DE = forwardRef<SVGSVGElement, DEProps>(function DE(props: DEProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="DE"
      aria-label="Germany"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-DE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-DE-a)`}>
        <path fill="#F1B434" d="M0 72V48h72v24z" />
        <path fill="#DD2033" d="M0 48V24h72v24z" />
        <path fill="#31373D" d="M0 24V0h72v24z" />
      </g>
    </CountrySymbol>
  );
});

export default DE;
