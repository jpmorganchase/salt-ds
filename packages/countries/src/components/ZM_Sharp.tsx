// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type ZM_SharpProps = CountrySymbolProps;

const ZM_Sharp = forwardRef<SVGSVGElement, ZM_SharpProps>(function ZM_Sharp(
  props: ZM_SharpProps,
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
      data-testid="ZM_Sharp"
      style={style}
      aria-label="Zambia"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-ZM-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-ZM-a)`}>
        <path fill="#008259" d="M0 0h72v50H0z" />
        <path
          fill="#FF9E42"
          d="M60 23h12v38H60zm-16-8a8 8 0 0 1-8-8h24a8 8 0 0 1-8 8h-8Z"
        />
        <path fill="#31373D" d="M48 23h12v38H48z" />
        <path fill="#DD2033" d="M36 23h12v38H36z" />
      </g>
    </CountrySymbol>
  );
});

export default ZM_Sharp;
