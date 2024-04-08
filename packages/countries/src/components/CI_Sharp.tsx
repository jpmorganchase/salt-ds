// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CI_SharpProps = CountrySymbolProps;

const CI_Sharp = forwardRef<SVGSVGElement, CI_SharpProps>(function CI_Sharp(
  props: CI_SharpProps,
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
      data-testid="CI_Sharp"
      style={style}
      aria-label="Côte d&#39;Ivoire"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-CI-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-CI-a)`}>
        <path fill="#009B77" d="M48 0h24v50H48z" />
        <path fill="#F5F7F8" d="M24 0h24v50H24z" />
        <path fill="#FF9E42" d="M0 0h24v50H0z" />
      </g>
    </CountrySymbol>
  );
});

export default CI_Sharp;
