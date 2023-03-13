import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SaintVincentAndTheGrenadinesProps = CountrySymbolProps;

export const SaintVincentAndTheGrenadines = forwardRef<
  SVGSVGElement,
  SaintVincentAndTheGrenadinesProps
>(function SaintVincentAndTheGrenadines(
  props: SaintVincentAndTheGrenadinesProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="SaintVincentAndTheGrenadines"
      aria-label="saint vincent and the grenadines"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#009B77" d="M72 72H18V0h54z" />
        <path
          fill="#FBD381"
          fillRule="evenodd"
          d="M18 72h36V0H18v72Zm2-40.296 6.618 11.703 6.514-11.703L26.618 20 20 31.704ZM45.383 20l-6.514 11.703 6.514 11.704L52 31.703 45.383 20Zm-2.891 28.52L36 36.856 29.51 48.52 35.999 60l6.493-11.48Z"
          clipRule="evenodd"
        />
        <path fill="#004692" d="M18 72H0V0h18z" />
      </g>
    </CountrySymbol>
  );
});
