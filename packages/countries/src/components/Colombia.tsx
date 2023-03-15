import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type ColombiaProps = CountrySymbolProps;

const Colombia = forwardRef<SVGSVGElement, ColombiaProps>(function Colombia(
  props: ColombiaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Colombia"
      aria-label="colombia"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 72V54h72v18z" />
        <path fill="#F1B434" d="M0 36V0h72v36z" />
        <path fill="#004692" d="M0 54V36h72v18z" />
      </g>
    </CountrySymbol>
  );
});

export default Colombia;
