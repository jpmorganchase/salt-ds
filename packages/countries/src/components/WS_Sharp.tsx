// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type WS_SharpProps = CountrySymbolProps;

const WS_Sharp = forwardRef<SVGSVGElement, WS_SharpProps>(function WS_Sharp(
  props: WS_SharpProps,
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
      data-testid="WS_Sharp"
      style={style}
      aria-label="Samoa"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-WS-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-WS-a)`}>
        <path fill="#DD2033" d="M0 61v-72h72v72z" />
        <path fill="#004692" d="M0 34V0h44v34z" />
        <path
          fill="#F5F7F8"
          d="m13 12-1.788 4.045L7 16.584l3.106 3.038L9.292 24 13 21.5l3.708 2.5-.814-4.378L19 16.584l-4.212-.539L13 12Zm14 9-1.49 3.371-3.51.449 2.589 2.532-.68 3.648L27 28.917 30.09 31l-.679-3.648L32 24.82l-3.51-.449L27 21Zm4-18-1.788 4.045L25 7.584l3.106 3.038L27.292 15 31 12.5l3.708 2.5-.814-4.378L37 7.584l-4.212-.539L31 3Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default WS_Sharp;
