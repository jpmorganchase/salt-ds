// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type TD_SharpProps = CountrySymbolProps;

const TD_Sharp = forwardRef<SVGSVGElement, TD_SharpProps>(function TD_Sharp(
  props: TD_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="TD_Sharp"
      aria-label="Chad"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-TD-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-TD-a)`}>
        <path fill="#004692" d="M0 50h24V0H0z" />
        <path fill="#F1B434" d="M24 50h24V0H24z" />
        <path fill="#DD2033" d="M48 50h24V0H48z" />
      </g>
    </CountrySymbol>
  );
});

export default TD_Sharp;
