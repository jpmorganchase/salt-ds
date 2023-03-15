import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BurkinaFasoProps = CountrySymbolProps;

const BurkinaFaso = forwardRef<SVGSVGElement, BurkinaFasoProps>(
  function BurkinaFaso(props: BurkinaFasoProps, ref) {
    return (
      <CountrySymbol
        data-testid="BurkinaFaso"
        aria-label="burkina faso"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#008259" d="M0 72V36h72v36z" />
          <path fill="#DD2033" d="M0 36V0h72v36z" />
          <path
            fill="#FBD381"
            d="m36 19.286-4.982 11.269-11.732 1.5 8.653 8.464-2.27 12.195L36 45.75l10.33 6.964-2.27-12.195 8.654-8.465-11.732-1.5L36 19.287Z"
          />
        </g>
      </CountrySymbol>
    );
  }
);

export default BurkinaFaso;
