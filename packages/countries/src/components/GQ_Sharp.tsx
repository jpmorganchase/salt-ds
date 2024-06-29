import { useId } from "@salt-ds/core";
import { clsx } from "clsx";
// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type GQ_SharpProps = CountrySymbolProps;

const GQ_Sharp = forwardRef<SVGSVGElement, GQ_SharpProps>(function GQ_Sharp(
  props: GQ_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="GQ_Sharp"
      aria-label="Equatorial Guinea"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-GQ-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-GQ-a)`}>
        <path fill="#DD2033" d="M0 50V39h72v11z" />
        <path fill="#F5F7F8" d="M0 39V11h72v28z" />
        <path fill="#008259" d="M0 11V0h72v11z" />
        <path fill="#0091DA" d="M26 25-2-11v72l28-36Z" />
        <path
          fill="#C1C3C3"
          d="M36 14h20v7.941a14.857 14.857 0 0 1-9.34 13.795L46 36l-.66-.264A14.857 14.857 0 0 1 36 21.94V14Z"
        />
        <path fill="#936846" d="M44 25h4v6h-4z" />
        <path
          fill="#009B77"
          d="M50 21a4 4 0 1 0-8 0 2 2 0 0 0 0 4h8a2 2 0 0 0 0-4Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default GQ_Sharp;
