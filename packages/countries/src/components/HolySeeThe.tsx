import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type HolySeeTheProps = CountrySymbolProps;

const HolySeeThe = forwardRef<SVGSVGElement, HolySeeTheProps>(
  function HolySeeThe(props: HolySeeTheProps, ref) {
    return (
      <CountrySymbol
        data-testid="HolySeeThe"
        aria-label="holy see (the)"
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
            fill="#F1B434"
            d="M-.2 72V0h36v72zm48.5-50v3h3.5v6h3v-6h3.5v-3h-3.5v-3h-3v3h-3.5Z"
          />
          <path
            fill="#F1B434"
            fillRule="evenodd"
            d="m63.846 26.333 2.121 2.121-.881.882 3.613 3.614-4.95 4.95-3.613-3.614-8.5 8.499a6.5 6.5 0 1 1-2.051-2.191l14.261-14.261ZM43.517 48.486a3.5 3.5 0 1 0 4.95-4.95 3.5 3.5 0 0 0-4.95 4.95Z"
            clipRule="evenodd"
          />
          <path
            fill="#C1C3C3"
            fillRule="evenodd"
            d="m42.535 26-2.121 2.122 1.048 1.048-3.78 3.78 4.95 4.95 3.78-3.78 8.457 8.457a6.5 6.5 0 1 0 2.13-2.113L42.534 26Zm20.329 22.486a3.5 3.5 0 1 1-4.95-4.95 3.5 3.5 0 0 1 4.95 4.95Z"
            clipRule="evenodd"
          />
        </g>
      </CountrySymbol>
    );
  }
);

export default HolySeeThe;
