import { useId } from "@salt-ds/core";
import { clsx } from "clsx";
// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type LU_SharpProps = CountrySymbolProps;

const LU_Sharp = forwardRef<SVGSVGElement, LU_SharpProps>(function LU_Sharp(
  props: LU_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="LU_Sharp"
      aria-label="Luxembourg"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-LU-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-LU-a)`}>
        <path fill="#0091DA" d="M0 50V34h72v16z" />
        <path fill="#F5F7F8" d="M0 34V16h72v18z" />
        <path fill="#DD2033" d="M0 16V0h72v16z" />
      </g>
    </CountrySymbol>
  );
});

export default LU_Sharp;
