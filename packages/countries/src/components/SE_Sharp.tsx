// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type SE_SharpProps = CountrySymbolProps;

const SE_Sharp = forwardRef<SVGSVGElement, SE_SharpProps>(function SE_Sharp(
  props: SE_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="SE_Sharp"
      aria-label="Sweden"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-SE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-SE-a)`}>
        <path fill="#005EB8" d="M0 0h72v50H0z" />
        <path fill="#FBD381" d="M14 61h14V32h44V18H28v-29H14v29H0v14h14v29Z" />
      </g>
    </CountrySymbol>
  );
});

export default SE_Sharp;
