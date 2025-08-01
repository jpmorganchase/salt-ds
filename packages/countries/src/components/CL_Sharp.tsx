// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type CL_SharpProps = CountrySymbolProps;

const CL_Sharp = forwardRef<SVGSVGElement, CL_SharpProps>(function CL_Sharp(
  props: CL_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="CL_Sharp"
      aria-label="Chile"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-CL-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-CL-a)`}>
        <path fill="#dd2033" d="M0 20V10h29v10z" />
        <path fill="#f5f7f8" d="M0 10V0h29v10z" />
        <path fill="#004692" d="M0 0h14.5v10H0z" />
        <path
          fill="#f5f7f8"
          d="m8.056 1.6-.96 2.157-2.263.288 1.669 1.62L6.064 8l1.992-1.333L10.047 8 9.61 5.665l1.668-1.62-2.262-.288z"
        />
      </g>
    </CountrySymbol>
  );
});

export default CL_Sharp;
