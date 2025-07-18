// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type MA_SharpProps = CountrySymbolProps;

const MA_Sharp = forwardRef<SVGSVGElement, MA_SharpProps>(function MA_Sharp(
  props: MA_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="MA_Sharp"
      aria-label="Morocco"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-MA-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-MA-a)`}>
        <path fill="#dd2033" d="M0 20V0h29v20z" />
        <path
          fill="#005b33"
          d="M22.556 8.111h-6.154L14.5 2l-1.902 6.111H6.444l4.98 3.777L9.52 18l4.979-3.777L19.479 18l-1.902-6.111zm-9.74 3.305.643-2.067h2.082l.643 2.067-1.684 1.277zm2.34-3.305h-1.311l.655-2.106zm2.036 2.54-.405-1.302h2.12zm-4.979-1.302-.405 1.302-1.716-1.302zm-.437 5.41.655-2.106 1.06.805zm3.732-1.301 1.06-.805.656 2.107z"
        />
      </g>
    </CountrySymbol>
  );
});

export default MA_Sharp;
