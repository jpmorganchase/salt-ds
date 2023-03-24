import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type AntarcticaProps = CountrySymbolProps;

const Antarctica = forwardRef<SVGSVGElement, AntarcticaProps>(
  function Antarctica(props: AntarcticaProps, ref) {
    return (
      <CountrySymbol
        data-testid="Antarctica"
        aria-label="antarctica"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#0091DA" d="M0 0h72v72H0z" />
          <path
            fill="#F5F7F8"
            d="M25.338 29.263c-6.005 2.018-9.619-3.362-11.009-5.211-1.067.672-1 2.634-.834 3.53L18 35.315c.4 6.86 3.28 10.816 4.67 11.936 5.07 2.287 11.453 1.962 14.01 1.513 2.002 1.345.834 4.035 0 5.212 16.013 5.245 19.126-10.928 18.681-19.67l-3.002-1.512c.8-3.9-.334-7.453-1-8.742L34.177 18l-5.338 3.362c-.055 2.354-.834 7.229-3.502 7.901Z"
          />
        </g>
      </CountrySymbol>
    );
  }
);

export default Antarctica;
