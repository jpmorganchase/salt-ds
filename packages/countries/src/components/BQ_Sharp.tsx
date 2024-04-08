// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BQ_SharpProps = CountrySymbolProps;

const BQ_Sharp = forwardRef<SVGSVGElement, BQ_SharpProps>(function BQ_Sharp(
  props: BQ_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "0",
  };

  return (
    <CountrySymbol
      data-testid="BQ_Sharp"
      style={style}
      aria-label="Bonaire Sint Eustatius and Saba"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-BQ-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-BQ-a)`}>
        <path fill="#004692" d="M0 50V34h72v16z" />
        <path fill="#F5F7F8" d="M0 34V16h72v18z" />
        <path fill="#A00009" d="M0 16V0h72v16z" />
      </g>
    </CountrySymbol>
  );
});

export default BQ_Sharp;
