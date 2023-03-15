import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type ScotlandProps = CountrySymbolProps;

const Scotland = forwardRef<SVGSVGElement, ScotlandProps>(function Scotland(
  props: ScotlandProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Scotland"
      aria-label="scotland"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#005EB8" d="M0 0h72v72H0z" />
        <path
          fill="#F5F7F8"
          d="M65.164 12.364 58.8 6 36.3 28.5 13.888 6.088l-6.364 6.364 22.412 22.412L6.455 58.346l6.364 6.363L36.3 41.228 60.043 64.97l6.364-6.364-23.743-23.743 22.5-22.5Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Scotland;
