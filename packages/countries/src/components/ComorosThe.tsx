import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type ComorosTheProps = CountrySymbolProps;

const ComorosThe = forwardRef<SVGSVGElement, ComorosTheProps>(
  function ComorosThe(props: ComorosTheProps, ref) {
    return (
      <CountrySymbol
        data-testid="ComorosThe"
        aria-label="comoros (the)"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#004692" d="M0 72V54h72v18z" />
          <path fill="#DD2033" d="M0 54V36h72v18z" />
          <path fill="#F5F7F8" d="M0 36V18h72v18z" />
          <path fill="#FBD381" d="M0 18V0h72v18z" />
          <path fill="#009B77" d="M48 36 0 0v72l48-36Z" />
          <path
            fill="#F5F7F8"
            d="M10.4 36c0-6.631 4.61-12.185 10.8-13.633A14.042 14.042 0 0 0 18 22c-7.732 0-14 6.268-14 14s6.268 14 14 14a14.06 14.06 0 0 0 3.2-.367C15.01 48.185 10.4 42.63 10.4 36Zm15-5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm3 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </g>
      </CountrySymbol>
    );
  }
);

export default ComorosThe;
