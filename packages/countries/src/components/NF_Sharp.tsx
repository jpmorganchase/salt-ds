// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type NF_SharpProps = CountrySymbolProps;

const NF_Sharp = forwardRef<SVGSVGElement, NF_SharpProps>(function NF_Sharp(
  props: NF_SharpProps,
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
      data-testid="NF_Sharp"
      style={style}
      aria-label="Norfolk Island"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-NF-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-NF-a)`}>
        <path fill="#008259" d="M0 0h72v50H0z" />
        <path fill="#F5F7F8" d="M54 50H18V0h36z" />
        <path fill="#008259" d="M48 35.875 36 5 24 35.875h9V44h6v-8.125h9Z" />
      </g>
    </CountrySymbol>
  );
});

export default NF_Sharp;
