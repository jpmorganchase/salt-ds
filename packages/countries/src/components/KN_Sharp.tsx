// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type KN_SharpProps = CountrySymbolProps;

const KN_Sharp = forwardRef<SVGSVGElement, KN_SharpProps>(function KN_Sharp(
  props: KN_SharpProps,
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
      data-testid="KN_Sharp"
      style={style}
      aria-label="Saint Kitts and Nevis"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-KN-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-KN-a)`}>
        <path fill="#009B77" d="M0 0h72v50H0z" />
        <path fill="#DD2033" d="M72 61H0l72-72v72Z" />
        <path
          fill="#FBD381"
          d="m-6.11 45.483 22.627 22.628L79.86 4.767 57.233-17.861z"
        />
        <path
          fill="#31373D"
          d="M11.765 64.197-2.377 50.055l64.883-64.882L76.648-.685z"
        />
        <path
          fill="#F5F7F8"
          d="m16.857 33.77 2.128 5.5-3.463 4.478 5.793-.064 3.36 4.895 1.139-5.853 5.853-1.139-4.896-3.36.064-5.793-4.478 3.463-5.5-2.127ZM44.97 5.657l2.128 5.5-3.463 4.478 5.793-.064 3.36 4.896 1.139-5.854 5.853-1.139-4.896-3.36.064-5.793-4.478 3.464-5.5-2.128Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default KN_Sharp;
