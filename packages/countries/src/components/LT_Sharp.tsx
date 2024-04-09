// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type LT_SharpProps = CountrySymbolProps;

const LT_Sharp = forwardRef<SVGSVGElement, LT_SharpProps>(function LT_Sharp(
  props: LT_SharpProps,
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
      data-testid="LT_Sharp"
      style={style}
      aria-label="Lithuania"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-LT-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-LT-a)`}>
        <path fill="#A00009" d="M0 50V34h72v16z" />
        <path fill="#005B33" d="M0 34V16h72v18z" />
        <path fill="#F1B434" d="M0 16V0h72v16z" />
      </g>
    </CountrySymbol>
  );
});

export default LT_Sharp;
