// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type FI_SharpProps = CountrySymbolProps;

const FI_Sharp = forwardRef<SVGSVGElement, FI_SharpProps>(function FI_Sharp(
  props: FI_SharpProps,
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
      data-testid="FI_Sharp"
      style={style}
      aria-label="Finland"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-FI-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-FI-a)`}>
        <path fill="#F5F7F8" d="M0 0h72v50H0z" />
        <path fill="#005EB8" d="M14 50h14V32h44V18H28V0H14v18H0v14h14v18Z" />
      </g>
    </CountrySymbol>
  );
});

export default FI_Sharp;
