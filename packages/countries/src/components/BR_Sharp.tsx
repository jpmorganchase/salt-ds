// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BR_SharpProps = CountrySymbolProps;

const BR_Sharp = forwardRef<SVGSVGElement, BR_SharpProps>(function BR_Sharp(
  props: BR_SharpProps,
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
      data-testid="BR_Sharp"
      style={style}
      aria-label="Brazil"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-BR-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-BR-a)`}>
        <path fill="#008259" d="M0 0h72v50H0z" />
        <path fill="#F1B434" d="m36 3 30 22-30 22L6 25 36 3Z" />
        <path
          fill="#004692"
          d="M36.5 39C43.956 39 50 32.732 50 25s-6.044-14-13.5-14S23 17.268 23 25s6.044 14 13.5 14Z"
        />
        <path
          fill="#F5F7F8"
          d="M23.202 22.576A24.584 24.584 0 0 1 28.5 22c7.935 0 15.102 3.799 19.803 9.8a14.292 14.292 0 0 0 1.655-5.686C44.448 20.48 36.868 17 28.5 17c-1.078 0-2.144.058-3.193.17a14.214 14.214 0 0 0-2.105 5.406Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default BR_Sharp;
