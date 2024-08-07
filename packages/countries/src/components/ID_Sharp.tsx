// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type ID_SharpProps = CountrySymbolProps;

const ID_Sharp = forwardRef<SVGSVGElement, ID_SharpProps>(function ID_Sharp(
  props: ID_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="ID_Sharp"
      aria-label="Indonesia"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-ID-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-ID-a)`}>
        <path fill="#DD2033" d="M0 0h72v50H0z" />
        <path fill="#F5F7F8" d="M0 25h72v25H0z" />
      </g>
    </CountrySymbol>
  );
});

export default ID_Sharp;
