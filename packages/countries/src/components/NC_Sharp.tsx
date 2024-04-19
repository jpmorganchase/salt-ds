// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type NC_SharpProps = CountrySymbolProps;

const NC_Sharp = forwardRef<SVGSVGElement, NC_SharpProps>(function NC_Sharp(
  props: NC_SharpProps,
  ref
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="NC_Sharp"
      aria-label="New Caledonia"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-NC-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-NC-a)`}>
        <path fill="#004692" d="M0 50h24V0H0z" />
        <path fill="#F5F7F8" d="M24 50h24V0H24z" />
        <path fill="#DD2033" d="M48 50h24V0H48z" />
      </g>
    </CountrySymbol>
  );
});

export default NC_Sharp;
