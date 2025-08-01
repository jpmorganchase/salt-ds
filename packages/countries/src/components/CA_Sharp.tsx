// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type CA_SharpProps = CountrySymbolProps;

const CA_Sharp = forwardRef<SVGSVGElement, CA_SharpProps>(function CA_Sharp(
  props: CA_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="CA_Sharp"
      aria-label="Canada"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-CA-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-CA-a)`}>
        <path fill="#dd2033" d="M0 0h29v20H0z" />
        <path fill="#f5f7f8" d="M21.75 20H7.25V0h14.5z" />
        <path
          fill="#dd2033"
          d="M16.155 5.437 14.465 3.2l-1.692 2.237-1.338-.406 1.078 4.717-1.34-2.142-.48.912-2.027-.3.299 2.031-.91.482 3.553 2.233-.434 1.418 2.663-.717V16.8h1.188v-3.16l2.758.742-.43-1.4.004.004 3.587-2.264-.893-.473.299-2.03-2.026.299-.473-.896-1.44 2.293-.065-.215 1.062-4.644z"
        />
      </g>
    </CountrySymbol>
  );
});

export default CA_Sharp;
