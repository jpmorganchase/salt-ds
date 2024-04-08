// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BZ_SharpProps = CountrySymbolProps;

const BZ_Sharp = forwardRef<SVGSVGElement, BZ_SharpProps>(function BZ_Sharp(
  props: BZ_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "0",
  };

  return (
    <CountrySymbol
      data-testid="BZ_Sharp"
      style={style}
      aria-label="Belize"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-BZ-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-BZ-a)`}>
        <path fill="#DD2033" d="M0 61v-72h72v72z" />
        <path fill="#004692" d="M0 4h72v42H0z" />
        <circle cx="36" cy="25" r="18" fill="#F5F7F8" />
        <path
          fill="#009B77"
          fillRule="evenodd"
          d="M36 36.25c6.213 0 11.25-5.037 11.25-11.25S42.213 13.75 36 13.75 24.75 18.787 24.75 25 29.787 36.25 36 36.25ZM36 40c8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15-8.284 0-15 6.716-15 15 0 8.284 6.716 15 15 15Z"
          clipRule="evenodd"
        />
        <path
          fill="#86C5FA"
          d="M29 19h14v4.76c0 4.53-2.78 8.596-7 10.24a10.99 10.99 0 0 1-7-10.24V19Z"
        />
        <mask
          id={`${uid}-BZ-b`}
          x="29"
          y="19"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path
            fill="#86C5FA"
            d="M29 19h14v4.76c0 4.53-2.78 8.596-7 10.24a10.99 10.99 0 0 1-7-10.24V19Z"
          />
        </mask>
        <g mask={`url(#${uid}-BZ-b)`}>
          <path
            fill="#F1B434"
            d="m28.35 18.303 7.038-7.038 13.258 13.259-7.038 7.037z"
          />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default BZ_Sharp;
