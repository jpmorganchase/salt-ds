// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CanadaProps = CountrySymbolProps;

const Canada = forwardRef<SVGSVGElement, CanadaProps>(function Canada(
  props: CanadaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Canada"
      aria-label="Canada"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="CA__a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle
          cx="36"
          cy="36"
          r="36"
          fill="#D9D9D9"
          transform="rotate(-90 36 36)"
        />
      </mask>
      <g mask="url(#CA__a)">
        <path fill="#DD2033" d="M0 0h72v72H0z" />
        <path fill="#F5F7F8" d="M54 72H18V0h36z" />
        <path
          fill="#DD2033"
          d="m40.11 24.591-4.2-5.59-4.198 5.59-3.322-1.014 2.677 11.794-3.328-5.357-1.193 2.28-5.03-.749.742 5.078L20 37.827l8.821 5.583-1.08 3.544 6.613-1.792V53h2.95v-7.9l6.847 1.855-1.066-3.498.007.008L52 37.806l-2.219-1.183.742-5.077-5.03.748-1.172-2.24-3.574 5.732-.163-.535 2.636-11.61-3.11.95Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Canada;
