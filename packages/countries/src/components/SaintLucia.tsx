import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SaintLuciaProps = CountrySymbolProps;

const SaintLucia = forwardRef<SVGSVGElement, SaintLuciaProps>(
  function SaintLucia(props: SaintLuciaProps, ref) {
    return (
      <CountrySymbol
        data-testid="SaintLucia"
        aria-label="saint lucia"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle
            cx="36"
            cy="36"
            r="36"
            fill="#D9D9D9"
            transform="rotate(-90 36 36)"
          />
        </mask>
        <g mask="url(#a)">
          <path fill="#0091DA" d="M72 72H0V0h72z" />
          <path
            fill="#F5F7F8"
            d="m35.9 12-21 46h-3.298L35.9 4.776 60.198 58H56.9l-21-46Z"
          />
          <path fill="#31373D" d="m35.9 12 21 46h-42l21-46Z" />
          <path fill="#F1B434" d="m36 34 24.5 24h-49L36 34Z" />
        </g>
      </CountrySymbol>
    );
  }
);

export default SaintLucia;
