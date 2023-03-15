import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type LaoPeoplesDemocraticRepublicTheProps = CountrySymbolProps;

const LaoPeoplesDemocraticRepublicThe = forwardRef<
  SVGSVGElement,
  LaoPeoplesDemocraticRepublicTheProps
>(function LaoPeoplesDemocraticRepublicThe(
  props: LaoPeoplesDemocraticRepublicTheProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="LaoPeoplesDemocraticRepublicThe"
      aria-label="lao people&#39;s democratic republic (the)"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 0h72v72H0z" />
        <path fill="#004692" d="M0 54V18h72v36z" />
        <circle cx="36" cy="36" r="15" fill="#F5F7F8" />
      </g>
    </CountrySymbol>
  );
});

export default LaoPeoplesDemocraticRepublicThe;
