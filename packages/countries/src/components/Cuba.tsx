import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CubaProps = CountrySymbolProps;

const Cuba = forwardRef<SVGSVGElement, CubaProps>(function Cuba(
  props: CubaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Cuba"
      aria-label="cuba"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#005EB8" d="M0 0h72v72H0z" />
        <path fill="#F5F7F8" d="M0 28V14h72v14zm0 30V44h72v14z" />
        <path fill="#DD2033" d="M48 36 0 0v72l48-36Z" />
        <path
          fill="#F5F7F8"
          d="m21 27-2.683 6.068-6.317.807 4.66 4.558L15.438 45 21 41.25 26.562 45l-1.222-6.567L30 33.875l-6.317-.807L21 27Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Cuba;
