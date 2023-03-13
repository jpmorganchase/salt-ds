import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type ChadProps = CountrySymbolProps;

export const Chad = forwardRef<SVGSVGElement, ChadProps>(function Chad(
  props: ChadProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Chad"
      aria-label="chad"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle
          cx="36"
          cy="36"
          r="36"
          fill="#D9D9D9"
          transform="matrix(1 0 0 -1 0 72)"
        />
      </mask>
      <g mask="url(#a)">
        <path fill="#004692" d="M0 72h24V0H0z" />
        <path fill="#F1B434" d="M24 72h24V0H24z" />
        <path fill="#DD2033" d="M48 72h24V0H48z" />
      </g>
    </CountrySymbol>
  );
});
