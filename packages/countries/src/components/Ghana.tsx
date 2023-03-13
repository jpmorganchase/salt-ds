import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GhanaProps = CountrySymbolProps;

export const Ghana = forwardRef<SVGSVGElement, GhanaProps>(function Ghana(
  props: GhanaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Ghana"
      aria-label="ghana"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#005B33" d="M0 72V48h72v24z" />
        <path fill="#FBD381" d="M0 48V24h72v24z" />
        <path fill="#DD2033" d="M0 24V0h72v24z" />
        <path
          fill="#31373D"
          d="m36 26-2.98 6.742-7.02.897 5.177 5.064L29.82 46 36 41.833 42.18 46l-1.357-7.297L46 33.64l-7.02-.897L36 26Z"
        />
      </g>
    </CountrySymbol>
  );
});
