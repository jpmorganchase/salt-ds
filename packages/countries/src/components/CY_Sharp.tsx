// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CY_SharpProps = CountrySymbolProps;

const CY_Sharp = forwardRef<SVGSVGElement, CY_SharpProps>(function CY_Sharp(
  props: CY_SharpProps,
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
      data-testid="CY_Sharp"
      style={style}
      aria-label="Cyprus"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-CY-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-CY-a)`}>
        <path fill="#F5F7F8" d="M0 0h72v50H0z" />
        <path
          fill="#FF9E42"
          d="M17.018 17.48s-.824 9.58 8.64 10.395l1.729 2.078 3.786.326s2.387-5.585 6.174-5.26c0 0 .33-3.831 4.115-3.505l5.68.488s-1.234-7.827 8.725-12.76L52.247 7S38.17 15.44 28.87 12.71l-.33 3.831-3.786-.325-1.728-2.08-6.009 3.344Z"
        />
        <path
          fill="#009B77"
          d="M17.775 30.588c2.244 5.697 7.476 9.989 13.864 11.118a3 3 0 0 0-.518 4.657l4.061-4.06 4.06 4.061a3 3 0 0 0-.601-4.71c6.26-1.203 11.373-5.452 13.584-11.066l-5.167-1.2C45.032 33.844 40.396 36.96 35 36.96c-5.395 0-10.031-3.116-12.057-7.572l-5.168 1.2Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default CY_Sharp;