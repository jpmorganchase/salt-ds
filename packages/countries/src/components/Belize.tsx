import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BelizeProps = CountrySymbolProps;

const Belize = forwardRef<SVGSVGElement, BelizeProps>(function Belize(
  props: BelizeProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Belize"
      aria-label="belize"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 72V0h72v72z" />
        <path fill="#004692" d="M0 8h72v56H0z" />
        <circle cx="36" cy="36" r="24" fill="#F5F7F8" />
        <path
          fill="#009B77"
          fillRule="evenodd"
          d="M36 51c8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15-8.284 0-15 6.716-15 15 0 8.284 6.716 15 15 15Zm0 5c11.046 0 20-8.954 20-20s-8.954-20-20-20-20 8.954-20 20 8.954 20 20 20Z"
          clipRule="evenodd"
        />
        <path
          fill="#86C5FA"
          d="M26.8 28h18v6.657A14.39 14.39 0 0 1 35.8 48a14.39 14.39 0 0 1-9-13.343V28Z"
        />
        <mask id="b" x="26" y="28" maskUnits="userSpaceOnUse" mask-type="alpha">
          <path
            fill="#86C5FA"
            d="M26.8 28h18v6.657A14.39 14.39 0 0 1 35.8 48a14.39 14.39 0 0 1-9-13.343V28Z"
          />
        </mask>
        <g mask="url(#b)">
          <path
            fill="#F1B434"
            d="m25.8 27.071 8.987-8.987 17.677 17.678-8.986 8.987z"
          />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default Belize;
