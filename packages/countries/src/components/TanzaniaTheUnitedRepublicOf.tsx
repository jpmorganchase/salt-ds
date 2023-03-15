import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type TanzaniaTheUnitedRepublicOfProps = CountrySymbolProps;

const TanzaniaTheUnitedRepublicOf = forwardRef<
  SVGSVGElement,
  TanzaniaTheUnitedRepublicOfProps
>(function TanzaniaTheUnitedRepublicOf(
  props: TanzaniaTheUnitedRepublicOfProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="TanzaniaTheUnitedRepublicOf"
      aria-label="tanzania (the united republic of)"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#009B77" d="M72 0H0v72L72 0Z" />
        <path fill="#0091DA" d="M72 72V0L0 72h72Z" />
        <path
          fill="#FBD381"
          d="M50.85-.063 72.062 21.15 21.15 72.062-.062 50.849z"
        />
        <path
          fill="#31373D"
          d="M67.82 16.908 55.092 4.18 4.18 55.092 16.908 67.82z"
        />
      </g>
    </CountrySymbol>
  );
});

export default TanzaniaTheUnitedRepublicOf;
