import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MauritaniaProps = CountrySymbolProps;

const Mauritania = forwardRef<SVGSVGElement, MauritaniaProps>(
  function Mauritania(props: MauritaniaProps, ref) {
    return (
      <CountrySymbol
        data-testid="Mauritania"
        aria-label="mauritania"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#DD2033" d="M0 0h72v72H0z" />
          <path fill="#005B33" d="M0 60V12h72v48z" />
          <path
            fill="#FBD381"
            d="M33.317 24.068 36 18l2.683 6.068 6.317.807-4.66 4.558L41.563 36 36 32.25 30.438 36l1.222-6.567L27 24.875l6.317-.807Z"
          />
          <path
            fill="#FBD381"
            d="M49.76 36.48A18.777 18.777 0 0 0 52.437 31c1.26 4.928.433 10.378-2.71 14.813-5.539 7.815-16.174 9.521-23.755 3.811-5.704-4.296-8.053-11.568-6.506-18.234.97 3.648 3.074 6.968 6.229 9.344 7.58 5.71 18.355 3.805 24.067-4.253Z"
          />
        </g>
      </CountrySymbol>
    );
  }
);

export default Mauritania;
