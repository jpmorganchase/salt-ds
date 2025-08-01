// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type AG_SharpProps = CountrySymbolProps;

const AG_Sharp = forwardRef<SVGSVGElement, AG_SharpProps>(function AG_Sharp(
  props: AG_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="AG_Sharp"
      aria-label="Antigua and Barbuda"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-AG-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-AG-a)`}>
        <path fill="#dd2033" d="M0 0h29v20H0z" />
        <mask
          id={`${uid}-AG-b`}
          x="-4"
          y="-6"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#31373d" d="M14.5 20 32.625-5.2h-36.25z" />
        </mask>
        <g mask={`url(#${uid}-AG-b)`}>
          <path fill="#31373d" d="M14.5 20 32.625-5.2h-36.25z" />
          <path
            fill="#f1b434"
            d="M9.736 7.745 6.444 9.2h16.112l-3.292-1.455 1.753-2.995-3.575.643L16.99 2 14.5 4.495 12.01 2l-.453 3.393-3.574-.643z"
          />
          <path fill="#f5f7f8" d="M8.056 14.8h12.889v9.6H8.056z" />
          <path fill="#005eb8" d="M4.833 9.2h19.334v5.6H4.833z" />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default AG_Sharp;
