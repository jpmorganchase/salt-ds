import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type FrenchSouthernTerritoriesTheProps = CountrySymbolProps;

const FrenchSouthernTerritoriesThe = forwardRef<
  SVGSVGElement,
  FrenchSouthernTerritoriesTheProps
>(function FrenchSouthernTerritoriesThe(
  props: FrenchSouthernTerritoriesTheProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="FrenchSouthernTerritoriesThe"
      aria-label="french southern territories (the)"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#004692" d="M0 0h72v72H0z" />
        <path fill="#F5F7F8" d="M0 0h38v38H0z" />
        <path fill="#004692" d="M0 36h12V0H0z" />
        <path fill="#DD2033" d="M24 36h12V0H24z" />
        <path
          fill="#F5F7F8"
          d="m38 44-1.788 4.045-4.212.539 3.106 3.038L34.292 56 38 53.5l3.708 2.5-.814-4.378L44 48.584l-4.212-.539L38 44Z"
        />
        <path
          fill="#F5F7F8"
          fillRule="evenodd"
          d="m44.763 44 2.364 3.844h6.755V61.25l-5.066-8.063L42 64.25h3.316l.669-1.219h5.653l2.566 4.688h3.592l2.566-4.688h5.653l.67 1.219H70l-6.816-11.063-5.066 8.063v-7.406h3.04l2.256-3.657h-5.296v-2.343h6.755L67.237 44H44.763Zm5.438 16.406-1.385-2.531-1.39 2.531h2.775Zm14.373 0h-2.775l1.385-2.531 1.39 2.531Z"
          clipRule="evenodd"
        />
        <path
          fill="#F5F7F8"
          d="M42.212 71.045 44 67l1.788 4.045 4.212.539-3.106 3.038.814 4.378L44 76.5 40.292 79l.814-4.378L38 71.584l4.212-.539Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default FrenchSouthernTerritoriesThe;
