import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type UkraineProps = CountrySymbolProps;

export const Ukraine = forwardRef<SVGSVGElement, UkraineProps>(function Ukraine(
  props: UkraineProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Ukraine"
      aria-label="ukraine"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#005EB8" d="M72 0v36H0V0z" />
        <path fill="#F1B434" d="M72 36v36H0V36z" />
      </g>
    </CountrySymbol>
  );
});
