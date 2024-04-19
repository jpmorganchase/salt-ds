// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type IE_SharpProps = CountrySymbolProps;

const IE_Sharp = forwardRef<SVGSVGElement, IE_SharpProps>(function IE_Sharp(
  props: IE_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="IE_Sharp"
      aria-label="Ireland"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": true })}
      {...rest}
    >
      <mask
        id={`${uid}-IE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-IE-a)`}>
        <path fill="#009B77" d="M0 50h24V0H0z" />
        <path fill="#F5F7F8" d="M24 50h24V0H24z" />
        <path fill="#FF9E42" d="M48 50h24V0H48z" />
      </g>
    </CountrySymbol>
  );
});

export default IE_Sharp;
