import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BahrainProps = CountrySymbolProps;

const Bahrain = forwardRef<SVGSVGElement, BahrainProps>(function Bahrain(
  props: BahrainProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Bahrain"
      aria-label="bahrain"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#F5F7F8" d="M0 0h72v72H0z" />
        <path
          fill="#DD2033"
          d="M20 0h52v72H20l10-9-10-9 10-9-10-9 10-9-10-9 10-9-10-9Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Bahrain;
