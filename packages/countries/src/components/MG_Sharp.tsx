// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MG_SharpProps = CountrySymbolProps;

const MG_Sharp = forwardRef<SVGSVGElement, MG_SharpProps>(function MG_Sharp(
  props: MG_SharpProps,
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
      data-testid="MG_Sharp"
      style={style}
      aria-label="Madagascar"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-MG-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-MG-a)`}>
        <path fill="#005B33" d="M0 50V25h72v25z" />
        <path fill="#DD2033" d="M0 25V0h72v25z" />
        <path fill="#F5F7F8" d="M0 0h24v50H0z" />
      </g>
    </CountrySymbol>
  );
});

export default MG_Sharp;