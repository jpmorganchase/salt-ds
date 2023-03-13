import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type LatviaProps = CountrySymbolProps;

export const Latvia = forwardRef<SVGSVGElement, LatviaProps>(function Latvia(
  props: LatviaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Latvia"
      aria-label="latvia"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#85001F" d="M0 0h72v72H0z" />
        <path fill="#F5F7F8" d="M0 45V27h72v18z" />
      </g>
    </CountrySymbol>
  );
});
