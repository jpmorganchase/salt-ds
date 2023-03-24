import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type ParaguayProps = CountrySymbolProps;

const Paraguay = forwardRef<SVGSVGElement, ParaguayProps>(function Paraguay(
  props: ParaguayProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Paraguay"
      aria-label="paraguay"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#004692" d="M0 72V52h72v20z" />
        <path fill="#F5F7F8" d="M0 52V20h72v32z" />
        <path fill="#DD2033" d="M0 20V0h72v20z" />
        <path
          fill="#009B77"
          fillRule="evenodd"
          d="M20 23.746A17.922 17.922 0 0 0 18 32c0 9.941 8.059 18 18 18s18-8.059 18-18c0-2.975-.722-5.782-2-8.254v.411l-5.202 2.601A11.951 11.951 0 0 1 48 32c0 6.627-5.373 12-12 12s-12-5.373-12-12c0-1.88.432-3.658 1.202-5.242L20 24.157v-.411Z"
          clipRule="evenodd"
        />
        <path
          fill="#F1B434"
          d="m36 23-2.385 5.394L28 29.11l4.142 4.052L31.056 39 36 35.667 40.944 39l-1.086-5.837L44 29.11l-5.615-.717L36 23Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Paraguay;
