import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type RussianFederationTheProps = CountrySymbolProps;

const RussianFederationThe = forwardRef<
  SVGSVGElement,
  RussianFederationTheProps
>(function RussianFederationThe(props: RussianFederationTheProps, ref) {
  return (
    <CountrySymbol
      data-testid="RussianFederationThe"
      aria-label="russian federation (the)"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 72V48h72v24z" />
        <path fill="#004692" d="M0 48V24h72v24z" />
        <path fill="#F5F7F8" d="M0 24V0h72v24z" />
      </g>
    </CountrySymbol>
  );
});

export default RussianFederationThe;
