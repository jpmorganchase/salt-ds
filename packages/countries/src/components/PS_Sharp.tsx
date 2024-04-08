// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type PS_SharpProps = CountrySymbolProps;

const PS_Sharp = forwardRef<SVGSVGElement, PS_SharpProps>(function PS_Sharp(
  props: PS_SharpProps,
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
      data-testid="PS_Sharp"
      style={style}
      aria-label="Palestine (State of)"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-PS-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-PS-a)`}>
        <path fill="#009B77" d="M0 50V34h72v16z" />
        <path fill="#F5F7F8" d="M0 34V16h72v18z" />
        <path fill="#31373D" d="M0 16V0h72v16z" />
        <path fill="#DD2033" d="M44 25-4-11v72l48-36Z" />
      </g>
    </CountrySymbol>
  );
});

export default PS_Sharp;
