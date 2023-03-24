import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type KyrgyzstanProps = CountrySymbolProps;

export const Kyrgyzstan = forwardRef<SVGSVGElement, KyrgyzstanProps>(
  function Kyrgyzstan(props: KyrgyzstanProps, ref) {
    return (
      <CountrySymbol
        data-testid="Kyrgyzstan"
        aria-label="kyrgyzstan"
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
          <path fill="#DD2033" d="M72 72H0V0h72z" />
          <path
            fill="#F1B434"
            d="M36 24c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12Z"
          />
          <path
            fill="#F1B434"
            fillRule="evenodd"
            d="m64 36-11.441 5.657 6.092 11.648-12.423-2.498L44.653 64 36 54.297 27.347 64l-1.575-13.193-12.423 2.498 6.092-11.648L8 36l11.442-5.657-6.094-11.648 12.424 2.498L27.347 8 36 17.703 44.654 8l1.574 13.193 12.424-2.498-6.093 11.648L64 36Zm-44 0c0-8.837 7.163-16 16-16s16 7.163 16 16-7.163 16-16 16-16-7.163-16-16Z"
            clipRule="evenodd"
          />
          <path
            fill="#DD2033"
            d="M25.478 30.226a19.38 19.38 0 0 1 7.339 2.724 23.47 23.47 0 0 0-6.078 10.681 12.055 12.055 0 0 0 3.487 2.891A19.455 19.455 0 0 1 36 35.43a19.455 19.455 0 0 1 5.774 11.093 12.054 12.054 0 0 0 3.487-2.89 23.47 23.47 0 0 0-6.078-10.682 19.38 19.38 0 0 1 7.34-2.724 12.054 12.054 0 0 0-2.892-3.487A23.395 23.395 0 0 0 36 30.262a23.393 23.393 0 0 0-7.631-3.523 12.054 12.054 0 0 0-2.891 3.487Z"
          />
        </g>
      </CountrySymbol>
    );
  }
);
