import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SwedenProps = CountrySymbolProps;

const Sweden = forwardRef<SVGSVGElement, SwedenProps>(function Sweden(
  props: SwedenProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Sweden"
      aria-label="sweden"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#005EB8" d="M0 0h72v72H0z" />
        <path fill="#FBD381" d="M14 72h14V43h44V29H28V0H14v29H0v14h14v29Z" />
      </g>
    </CountrySymbol>
  );
});

export default Sweden;
