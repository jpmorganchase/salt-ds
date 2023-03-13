import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type TuvaluProps = CountrySymbolProps;

export const Tuvalu = forwardRef<SVGSVGElement, TuvaluProps>(function Tuvalu(
  props: TuvaluProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Tuvalu"
      aria-label="tuvalu"
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
          fill="#FBD381"
          d="m52.8 26-1.49 3.371-3.51.449 2.589 2.532-.68 3.648 3.091-2.083L55.89 36l-.679-3.648L57.8 29.82l-3.51-.449L52.8 26ZM40.3 38.67l.395 3.664-2.815 2.144 3.508.898 1.236 3.5 1.634-3.35 3.718.259-2.412-2.82.976-3.487-3.264 1.366L40.3 38.67ZM57.8 43l-1.49 3.371-3.51.449 2.589 2.532-.68 3.648 3.091-2.083L60.89 53l-.679-3.648L62.8 46.82l-3.51-.449L57.8 43Zm-12.294 8.17-.567 3.642-3.274 1.342 3.156 1.776.288 3.7 2.446-2.813 3.524 1.213-1.6-3.348 1.845-3.116-3.506.475-2.312-2.87ZM32.8 56l-1.49 3.371-3.51.449 2.589 2.532-.68 3.648 3.091-2.083L35.89 66l-.679-3.648L37.8 59.82l-3.51-.449L32.8 56Z"
        />
        <mask id="b" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <path fill="#002F6C" d="M0 36C0 16.118 16.118 0 36 0v36H0Z" />
        </mask>
        <g mask="url(#b)">
          <path fill="#004692" d="M0 0h36v36H0z" />
          <path
            fill="#F5F7F8"
            d="m12.522 3.134-2.121 2.121 29.526 29.526 2.121-2.121L12.522 3.134ZM6.865 8.79 3.33 12.327l29.526 29.526 3.535-3.535L6.866 8.79Z"
          />
          <path
            fill="#DD2033"
            d="m6.865 8.79 3.536-3.535 29.526 29.526-3.535 3.536L6.864 8.79Z"
          />
          <path fill="#F5F7F8" d="M36 12v5H17v19h-5V12h24Z" />
          <path fill="#F5F7F8" d="M36-2v5H5v33H0V-2h36Z" />
          <path
            fill="#DD2033"
            fillRule="evenodd"
            d="M3 36h9V12h24V3H3v33Z"
            clipRule="evenodd"
          />
        </g>
      </g>
    </CountrySymbol>
  );
});
