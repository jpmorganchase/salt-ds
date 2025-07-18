// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type BE_SharpProps = CountrySymbolProps;

const BE_Sharp = forwardRef<SVGSVGElement, BE_SharpProps>(function BE_Sharp(
  props: BE_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="BE_Sharp"
      aria-label="Belgium"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-BE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-BE-a)`}>
        <path fill="#31373d" d="M0 0h9.667v20H0z" />
        <path fill="#f1b434" d="M9.667 0h9.667v20H9.667z" />
        <path fill="#dd2033" d="M19.333 0H29v20h-9.667z" />
      </g>
    </CountrySymbol>
  );
});

export default BE_Sharp;
