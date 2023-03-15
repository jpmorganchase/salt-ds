import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GreeceProps = CountrySymbolProps;

const Greece = forwardRef<SVGSVGElement, GreeceProps>(function Greece(
  props: GreeceProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Greece"
      aria-label="greece"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#005EB8" d="M0 72V0h72v72z" />
        <path
          fill="#F5F7F8"
          d="M36 9v9h36V9H36Zm0 18v9h36v-9H36ZM0 54v-9h72v9H0Zm0 9v9h72v-9H0ZM22 0h-9v18H0v9h13v18h9V27h14v-9H22V0Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Greece;
