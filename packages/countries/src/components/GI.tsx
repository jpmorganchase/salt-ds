// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type GIProps = CountrySymbolProps;

const GI = forwardRef<SVGSVGElement, GIProps>(function GI(props: GIProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="GI"
      aria-label="Gibraltar"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-GI-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle
          cx="10"
          cy="10"
          r="10"
          fill="#d9d9d9"
          transform="rotate(-90 10 10)"
        />
      </mask>
      <g mask={`url(#${uid}-GI-a)`}>
        <path fill="#f5f7f8" d="M0 0h20v13.333H0z" />
        <path
          fill="#dd2033"
          d="M0 13.333h20V20H0zm5.833-7.777v1.11h.556v-1.11H7.5v1.11h-.556v1.945h1.39V4.722h-.556v-1.11h1.11v1.11h.556v-1.11h1.112v1.11h.555v-1.11h1.111v1.11h-.555v3.89h1.389V6.666H12.5v-1.11h1.111v1.11h.556v-1.11h1.11v1.11h-.555v1.945H15v3.611H5v-3.61h.278V6.666h-.556v-1.11z"
        />
        <path
          fill="#f1b434"
          fillRule="evenodd"
          d="M10.167 18.611h-.834v-.335H7.944V16.33h1.39v-1.403a1.806 1.806 0 1 1 .833.042zm.644-5.417a.972.972 0 1 1-1.944 0 .972.972 0 0 1 1.944 0"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default GI;
