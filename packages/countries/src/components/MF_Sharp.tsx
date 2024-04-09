// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MF_SharpProps = CountrySymbolProps;

const MF_Sharp = forwardRef<SVGSVGElement, MF_SharpProps>(function MF_Sharp(
  props: MF_SharpProps,
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
      data-testid="MF_Sharp"
      style={style}
      aria-label="Saint Martin (French part)"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-MF-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-MF-a)`}>
        <path fill="#004692" d="M0 50h24V0H0z" />
        <path fill="#F5F7F8" d="M24 50h24V0H24z" />
        <path fill="#DD2033" d="M48 50h24V0H48z" />
      </g>
    </CountrySymbol>
  );
});

export default MF_Sharp;
