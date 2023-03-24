import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type ChristmasIslandProps = CountrySymbolProps;

export const ChristmasIsland = forwardRef<SVGSVGElement, ChristmasIslandProps>(
  function ChristmasIsland(props: ChristmasIslandProps, ref) {
    return (
      <CountrySymbol
        data-testid="ChristmasIsland"
        aria-label="christmas island"
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
            transform="matrix(1 0 0 -1 0 72)"
          />
        </mask>
        <g mask="url(#a)">
          <path fill="#004692" d="M0 72h72V0H0z" />
          <path fill="#008259" d="M72.6 0v72L.6 0h72Z" />
          <path
            fill="#F1B434"
            fillRule="evenodd"
            d="M62.208 31.436c-1.139.676-1.767 1.702-1.986 2.363-.432 1.306-2.247 1.39-2.798.13-.785-1.791-2.244-2.587-3.951-2.846-1.763-.266-3.648.08-4.82.49l-.989-2.833c1.504-.524 3.892-.98 6.258-.623 1.704.258 3.458.957 4.803 2.39a7.748 7.748 0 0 1 1.952-1.65c1.887-1.12 4.458-1.563 7.712-.603l-.848 2.877c-2.553-.752-4.247-.34-5.333.305Z"
            clipRule="evenodd"
          />
          <path
            fill="#F5F7F8"
            d="M11.83 28.64 10.6 26l-1.23 2.64-2.78-.66 1.245 2.633L5.6 32.431l2.783.643L8.375 36l2.225-1.83L12.825 36l-.007-2.926 2.782-.643-2.235-1.818 1.245-2.632-2.78.659ZM2.6 38l1.23 2.64 2.78-.66-1.245 2.633L7.6 44.431l-2.782.643L4.825 48 2.6 46.17.375 48l.008-2.926-2.783-.643 2.235-1.818-1.245-2.632 2.78.658L2.6 38Zm16 23 1.23 2.64 2.78-.66-1.245 2.633 2.235 1.818-2.782.643.007 2.926-2.225-1.83L16.375 71l.008-2.926-2.783-.643 2.235-1.818-1.245-2.632 2.78.658L18.6 61Zm2-27 1.23 2.64 2.78-.66-1.245 2.633 2.235 1.818-2.782.643.007 2.926-2.225-1.83L18.375 44l.008-2.926-2.783-.643 2.235-1.818-1.245-2.632 2.78.658L20.6 34Zm-5.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
          />
          <circle cx="36.1" cy="35.5" r="8.5" fill="#F1B434" />
        </g>
      </CountrySymbol>
    );
  }
);
