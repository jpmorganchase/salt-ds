// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BWProps = CountrySymbolProps;

const BW = forwardRef<SVGSVGElement, BWProps>(function BW(props: BWProps, ref) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="BW"
      aria-label="Botswana"
      viewBox="0 0 72 72"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: false })}
      {...rest}
    >
      <mask
        id={`${uid}-BW-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-BW-a)`}>
        <path fill="#86C5FA" d="M0 72V0h72v72z" />
        <path fill="#F5F7F8" d="M0 48V24h72v24z" />
        <path fill="#31373D" d="M0 42V30h72v12z" />
      </g>
    </CountrySymbol>
  );
});

export default BW;
