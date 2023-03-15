import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type JapanProps = CountrySymbolProps;

const Japan = forwardRef<SVGSVGElement, JapanProps>(function Japan(
  props: JapanProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Japan"
      aria-label="japan"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#F5F7F8" d="M0 0h72v72H0z" />
        <circle cx="36" cy="36" r="16" fill="#DD2033" />
      </g>
    </CountrySymbol>
  );
});

export default Japan;
