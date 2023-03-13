import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CongoTheProps = CountrySymbolProps;

export const CongoThe = forwardRef<SVGSVGElement, CongoTheProps>(
  function CongoThe(props: CongoTheProps, ref) {
    return (
      <CountrySymbol
        data-testid="CongoThe"
        aria-label="congo (the)"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path
            fill="#DD2033"
            d="m36 86.912-16.97-16.97 50.912-50.913L86.912 36z"
          />
          <path
            fill="#FBD381"
            d="M19.03 69.941 2.06 52.971 52.97 2.059l16.97 16.97z"
          />
          <path
            fill="#009B77"
            d="M2.059 52.97-14.911 36 36-14.912l16.97 16.97z"
          />
        </g>
      </CountrySymbol>
    );
  }
);
