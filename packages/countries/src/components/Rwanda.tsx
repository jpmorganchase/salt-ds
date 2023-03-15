import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type RwandaProps = CountrySymbolProps;

const Rwanda = forwardRef<SVGSVGElement, RwandaProps>(function Rwanda(
  props: RwandaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Rwanda"
      aria-label="rwanda"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#005B33" d="M0 72V54h72v18z" />
        <path fill="#0091DA" d="M0 36V0h72v36z" />
        <path fill="#FBD381" d="M0 54V36h72v18z" />
      </g>
    </CountrySymbol>
  );
});

export default Rwanda;
