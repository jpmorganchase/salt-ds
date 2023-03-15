import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MadagascarProps = CountrySymbolProps;

const Madagascar = forwardRef<SVGSVGElement, MadagascarProps>(
  function Madagascar(props: MadagascarProps, ref) {
    return (
      <CountrySymbol
        data-testid="Madagascar"
        aria-label="madagascar"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#005B33" d="M0 72V36h72v36z" />
          <path fill="#DD2033" d="M0 36V0h72v36z" />
          <path fill="#F5F7F8" d="M0 0h24v72H0z" />
        </g>
      </CountrySymbol>
    );
  }
);

export default Madagascar;
