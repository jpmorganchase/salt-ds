// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BG_SharpProps = CountrySymbolProps;

const BG_Sharp = forwardRef<SVGSVGElement, BG_SharpProps>(function BG_Sharp(
  props: BG_SharpProps,
  ref
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="BG_Sharp"
      aria-label="Bulgaria"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-BG-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-BG-a)`}>
        <path fill="#DD2033" d="M0 50V34h72v16z" />
        <path fill="#009B77" d="M0 34V16h72v18z" />
        <path fill="#F5F7F8" d="M0 16V0h72v16z" />
      </g>
    </CountrySymbol>
  );
});

export default BG_Sharp;
