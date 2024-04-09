// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type DK_SharpProps = CountrySymbolProps;

const DK_Sharp = forwardRef<SVGSVGElement, DK_SharpProps>(function DK_Sharp(
  props: DK_SharpProps,
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
      data-testid="DK_Sharp"
      style={style}
      aria-label="Denmark"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-DK-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-DK-a)`}>
        <path fill="#DD2033" d="M0 0h72v50H0z" />
        <path fill="#F5F7F8" d="M14 61h14V32h44V18H28v-29H14v29H0v14h14v29Z" />
      </g>
    </CountrySymbol>
  );
});

export default DK_Sharp;
