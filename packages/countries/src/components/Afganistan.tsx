import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type AfganistanProps = CountrySymbolProps;

export const Afganistan = forwardRef<SVGSVGElement, AfganistanProps>(
  function Afganistan(props: AfganistanProps, ref) {
    return (
      <CountrySymbol
        data-testid="Afganistan"
        aria-label="afganistan"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#31373D" d="M0 0h20v72H0z" />
          <path fill="#DD2033" d="M20 0h32v72H20z" />
          <path fill="#005B33" d="M52 0h20v72H52z" />
          <path
            fill="#F5F7F8"
            fillRule="evenodd"
            d="M50 33c0 7.732-6.268 14-14 14s-14-6.268-14-14c0-3.035.966-5.845 2.607-8.138l3.255 2.325A9.954 9.954 0 0 0 26 33c0 5.523 4.477 10 10 10s10-4.477 10-10c0-2.168-.69-4.175-1.862-5.813l3.255-2.325A13.936 13.936 0 0 1 50 33ZM35.97 19h.06-.06Z"
            clipRule="evenodd"
          />
          <path
            fill="#F5F7F8"
            fillRule="evenodd"
            d="M39 29a3 3 0 1 0-6 0v6h6v-6Zm-3-6a6 6 0 0 1 6 6v9H30v-9a6 6 0 0 1 6-6Z"
            clipRule="evenodd"
          />
        </g>
      </CountrySymbol>
    );
  }
);
