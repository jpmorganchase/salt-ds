// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BH_SharpProps = CountrySymbolProps;

const BH_Sharp = forwardRef<SVGSVGElement, BH_SharpProps>(function BH_Sharp(
  props: BH_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="BH_Sharp"
      aria-label="Bahrain"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": true })}
      {...rest}
    >
      <mask
        id={`${uid}-BH-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-BH-a)`}>
        <path fill="#F5F7F8" d="M0 0h72v50H0z" />
        <path
          fill="#DD2033"
          d="M30-2h42v54H30l-10-9 10-9-10-9 10-9-10-9 10-9Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default BH_Sharp;
