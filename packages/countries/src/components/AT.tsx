// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type ATProps = CountrySymbolProps;

const AT = forwardRef<SVGSVGElement, ATProps>(function AT(props: ATProps, ref) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "50%",
  };

  return (
    <CountrySymbol
      data-testid="AT"
      style={style}
      aria-label="Austria"
      viewBox="0 0 72 72"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-AT-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36.257" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-AT-a)`}>
        <path fill="#DD2033" d="M0 72V0h72v72z" />
        <path fill="#F5F7F8" d="M0 48V24h72v24z" />
      </g>
    </CountrySymbol>
  );
});

export default AT;
