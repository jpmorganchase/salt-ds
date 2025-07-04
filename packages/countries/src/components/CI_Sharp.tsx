// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type CI_SharpProps = CountrySymbolProps;

const CI_Sharp = forwardRef<SVGSVGElement, CI_SharpProps>(function CI_Sharp(
  props: CI_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="CI_Sharp"
      aria-label="Côte d&#39;Ivoire"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-CI-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-CI-a)`}>
        <path fill="#009b77" d="M19.333 0H29v20h-9.667z" />
        <path fill="#f5f7f8" d="M9.667 0h9.667v20H9.667z" />
        <path fill="#ff9e42" d="M0 0h9.667v20H0z" />
      </g>
    </CountrySymbol>
  );
});

export default CI_Sharp;
