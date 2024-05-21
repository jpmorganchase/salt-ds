// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type PK_SharpProps = CountrySymbolProps;

const PK_Sharp = forwardRef<SVGSVGElement, PK_SharpProps>(function PK_Sharp(
  props: PK_SharpProps,
  ref
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="PK_Sharp"
      aria-label="Pakistan"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-PK-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-PK-a)`}>
        <path fill="#005B33" d="M0 0h72v50H0z" />
        <path
          fill="#F5F7F8"
          d="M40.525 15.284 41.66 8l4.624 5.741 7.013-.95-3.69 6.231 3.2 6.697-7.049-2.425-4.891 5.624-.577-7.4-6.312-3.55 6.548-2.684Zm.375 22.128a16.92 16.92 0 0 0 5.526-.92A15.969 15.969 0 0 1 34 42.413c-8.837 0-16-7.163-16-16 0-6.65 4.056-12.352 9.83-14.767-2.15 2.702-3.43 6.09-3.43 9.767 0 8.837 7.387 16 16.5 16Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default PK_Sharp;
