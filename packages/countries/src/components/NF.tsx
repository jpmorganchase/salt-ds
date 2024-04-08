// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type NFProps = CountrySymbolProps;

const NF = forwardRef<SVGSVGElement, NFProps>(function NF(props: NFProps, ref) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "50%",
  };

  return (
    <CountrySymbol
      data-testid="NF"
      style={style}
      aria-label="Norfolk Island"
      viewBox="0 0 72 72"
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
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-NF-a)`}>
        <path fill="#008259" d="M0 0h72v72H0z" />
        <path fill="#F5F7F8" d="M54 72H18V0h36z" />
        <path fill="#008259" d="M48 46.875 36 16 24 46.875h9V55h6v-8.125h9Z" />
      </g>
    </CountrySymbol>
  );
});

export default NF;
