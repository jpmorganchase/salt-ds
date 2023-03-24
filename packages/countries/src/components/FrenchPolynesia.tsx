import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type FrenchPolynesiaProps = CountrySymbolProps;

export const FrenchPolynesia = forwardRef<SVGSVGElement, FrenchPolynesiaProps>(
  function FrenchPolynesia(props: FrenchPolynesiaProps, ref) {
    return (
      <CountrySymbol
        data-testid="FrenchPolynesia"
        aria-label="french polynesia"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#DD2033" d="M0 0h72v72H0z" />
          <path fill="#F5F7F8" d="M0 54V18h72v36z" />
          <mask
            id="b"
            x="21"
            y="21"
            maskUnits="userSpaceOnUse"
            mask-type="alpha"
          >
            <circle cx="36" cy="36" r="15" fill="#D9D9D9" />
          </mask>
          <g mask="url(#b)">
            <path
              fill="#005EB8"
              d="M32.25 37.636c.937-.818 1.874-1.636 3.749-1.636s2.813.818 3.75 1.636c.938.819 1.875 1.637 3.75 1.637 1.876 0 2.813-.818 3.75-1.637C48.188 36.818 49.126 36 51 36v5.727c-1.875 0-2.813.818-3.75 1.637-.938.818-1.875 1.636-3.75 1.636-1.876 0-2.813-.818-3.75-1.636-.938-.819-1.876-1.637-3.751-1.637s-2.812.818-3.75 1.637C31.312 44.182 30.374 45 28.5 45s-2.812-.818-3.75-1.636c-.937-.819-1.874-1.637-3.749-1.637V36c1.875 0 2.812.818 3.75 1.636.937.819 1.875 1.637 3.75 1.637 1.874 0 2.812-.818 3.75-1.637Zm0 10c.937-.818 1.874-1.636 3.749-1.636s2.813.818 3.75 1.636c.938.819 1.875 1.637 3.75 1.637 1.876 0 2.813-.818 3.75-1.637C48.188 46.818 49.126 46 51 46v5.727c-1.875 0-2.813.818-3.75 1.637-.938.818-1.875 1.636-3.75 1.636-1.876 0-2.813-.818-3.75-1.636-.938-.819-1.876-1.637-3.751-1.637s-2.812.818-3.75 1.637C31.312 54.182 30.374 55 28.5 55s-2.812-.818-3.75-1.636c-.937-.819-1.874-1.637-3.749-1.637V46c1.875 0 2.812.818 3.75 1.636.937.819 1.875 1.637 3.75 1.637 1.874 0 2.812-.818 3.75-1.637Z"
            />
            <path fill="#F1B434" d="M17 21h38v14H17z" />
          </g>
          <path fill="#DD2033" d="M38.2 24h-4v12h4V24Z" />
          <path
            fill="#DD2033"
            d="M31 36v-6h-4v6a7 7 0 0 0 7 7h4a7 7 0 0 0 7-7v-6h-4v6a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3Z"
          />
        </g>
      </CountrySymbol>
    );
  }
);
