import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BelgiumProps = CountrySymbolProps;

export const Belgium = forwardRef<SVGSVGElement, BelgiumProps>(function Belgium(
  props: BelgiumProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Belgium"
      aria-label="belgium"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#31373D" d="M0 0h24v72H0z" />
        <path fill="#F1B434" d="M24 0h24v72H24z" />
        <path fill="#DD2033" d="M48 0h24v72H48z" />
      </g>
    </CountrySymbol>
  );
});
