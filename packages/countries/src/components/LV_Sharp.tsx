// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type LV_SharpProps = CountrySymbolProps;

const LV_Sharp = forwardRef<SVGSVGElement, LV_SharpProps>(function LV_Sharp(
  props: LV_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="LV_Sharp"
      aria-label="Latvia"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": true })}
      {...rest}
    >
      <mask
        id={`${uid}-LV-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-LV-a)`}>
        <path fill="#85001F" d="M0 0h72v50H0z" />
        <path fill="#F5F7F8" d="M0 32V18h72v14z" />
      </g>
    </CountrySymbol>
  );
});

export default LV_Sharp;
