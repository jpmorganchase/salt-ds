// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BI_SharpProps = CountrySymbolProps;

const BI_Sharp = forwardRef<SVGSVGElement, BI_SharpProps>(function BI_Sharp(
  props: BI_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "0",
    "--saltCountrySymbol-aspect-ratio-multiplier": "1.44",
  };

  return (
    <CountrySymbol
      data-testid="BI_Sharp"
      style={style}
      aria-label="Burundi"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-BI-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-BI-a)`}>
        <path fill="#A00009" d="M0 0h72v50H0z" />
        <path fill="#009B77" d="m0-11 36 35 36-35v72L36 24 0 61v-72Z" />
        <path
          fill="#F5F7F8"
          d="m60.6-7 6.364 6.364-14.41 14.41A19.907 19.907 0 0 1 56 25c0 3.57-.936 6.923-2.575 9.825L70 51.4l-6.364 6.364-16.291-16.291A19.908 19.908 0 0 1 36 45c-4.161 0-8.026-1.27-11.227-3.446L9.5 56.828l-6.364-6.364 15.512-15.512A19.909 19.909 0 0 1 16 25a19.9 19.9 0 0 1 3.527-11.345L5.236-.636 11.6-7 26.175 7.575A19.909 19.909 0 0 1 36 5c3.623 0 7.021.963 9.952 2.648L60.6-7Z"
        />
        <path
          fill="#A00009"
          d="m36.4 10-1.788 4.045-4.212.539 3.106 3.038L32.692 22l3.708-2.5 3.708 2.5-.814-4.378 3.106-3.038-4.212-.539L36.4 10Zm-10 13-1.788 4.045-4.212.539 3.106 3.038L22.692 35l3.708-2.5 3.708 2.5-.814-4.378 3.106-3.038-4.212-.539L26.4 23Zm19 0-1.788 4.045-4.212.539 3.106 3.038L41.692 35l3.708-2.5 3.708 2.5-.814-4.378 3.106-3.038-4.212-.539L45.4 23Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default BI_Sharp;
