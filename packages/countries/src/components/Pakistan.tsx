import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type PakistanProps = CountrySymbolProps;

const Pakistan = forwardRef<SVGSVGElement, PakistanProps>(function Pakistan(
  props: PakistanProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Pakistan"
      aria-label="pakistan"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#005B33" d="M0 0h72v72H0z" />
        <path
          fill="#F5F7F8"
          d="m39.125 26.872 1.134-7.284 4.624 5.741 7.013-.95-3.69 6.231 3.2 6.697-7.049-2.425-4.891 5.624-.577-7.4-6.312-3.55 6.548-2.684ZM39.5 49a16.92 16.92 0 0 0 5.526-.92A15.969 15.969 0 0 1 32.6 54c-8.837 0-16-7.163-16-16 0-6.65 4.056-12.352 9.83-14.767C24.28 25.935 23 29.323 23 33c0 8.837 7.387 16 16.5 16Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Pakistan;
