// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type PSProps = CountrySymbolProps;

const PS = forwardRef<SVGSVGElement, PSProps>(function PS(props: PSProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="PS"
      aria-label="Palestine (State of)"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-PS-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-PS-a)`}>
        <path fill="#009B77" d="M0 72V48h72v24z" />
        <path fill="#F5F7F8" d="M0 48V24h72v24z" />
        <path fill="#31373D" d="M0 24V0h72v24z" />
        <path fill="#DD2033" d="M48 36 0 0v72l48-36Z" />
      </g>
    </CountrySymbol>
  );
});

export default PS;
