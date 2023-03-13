import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type YemenProps = CountrySymbolProps;

export const Yemen = forwardRef<SVGSVGElement, YemenProps>(function Yemen(
  props: YemenProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Yemen"
      aria-label="yemen"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#31373D" d="M0 72V48h72v24z" />
        <path fill="#F5F7F8" d="M0 48V24h72v24z" />
        <path fill="#DD2033" d="M0 24V0h72v24z" />
      </g>
    </CountrySymbol>
  );
});
