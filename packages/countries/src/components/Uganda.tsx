import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type UgandaProps = CountrySymbolProps;

export const Uganda = forwardRef<SVGSVGElement, UgandaProps>(function Uganda(
  props: UgandaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Uganda"
      aria-label="uganda"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#31373D" d="M0 48V0h72v48z" />
        <path fill="#F1B434" d="M0 24V12h72v12z" />
        <path fill="#DD2033" d="M0 72V60h72v12zm0-36V24h72v12z" />
        <path fill="#F1B434" d="M0 60V48h72v12z" />
        <circle cx="35" cy="36" r="20" fill="#F5F7F8" />
        <path
          stroke="#31373D"
          d="m34.5 37.298 2.69 3.027a1 1 0 0 1-.652 1.66l-7.086.675a1 1 0 0 0-.8 1.443l.348.695"
        />
        <path
          stroke="#31373D"
          d="M31 42.798a.927.927 0 0 0-.83 1.342l.33.658m.5-2 .5 1"
        />
        <path
          fill="#31373D"
          fillRule="evenodd"
          d="M40.403 43.55a6 6 0 1 0-7.39-9.236 8 8 0 0 1 7.39 9.237Z"
          clipRule="evenodd"
        />
        <path
          fill="#31373D"
          fillRule="evenodd"
          d="M34.438 27.7a6.002 6.002 0 0 0 .15 11.83 6 6 0 0 0 5.794-2.406 8 8 0 0 1-5.944-9.423Z"
          clipRule="evenodd"
        />
        <path
          fill="#DD2033"
          d="M36.798 24.438a3.5 3.5 0 0 0-4.096-2.779l.659 3.438 3.437-.66Z"
        />
        <circle cx="33" cy="25.798" r="2.5" fill="#31373D" />
        <path fill="#31373D" d="m28.5 27.298 3-2 1 1.5-4 .5Z" />
        <path
          fill="#DD2033"
          fillRule="evenodd"
          d="M39.374 38.204a7.963 7.963 0 0 1 1.126 4.094c0 .426-.033.845-.097 1.253a5.999 5.999 0 0 0 1.115-9.709 5.977 5.977 0 0 1-2.144 4.362Z"
          clipRule="evenodd"
        />
        <path
          stroke="#31373D"
          d="M34.5 37.298v11m0 0H31m3.5 0-1.5 2m1.5-2 2 .5"
        />
      </g>
    </CountrySymbol>
  );
});
