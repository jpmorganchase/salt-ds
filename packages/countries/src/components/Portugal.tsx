import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type PortugalProps = CountrySymbolProps;

const Portugal = forwardRef<SVGSVGElement, PortugalProps>(function Portugal(
  props: PortugalProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Portugal"
      aria-label="portugal"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#005B33" d="M0 0h28v72H0z" />
        <path fill="#DD2033" d="M28 0h44v72H28z" />
        <circle cx="27.4" cy="36" r="14" fill="#F1B434" />
        <path
          fill="#F5F7F8"
          d="M18.4 28h18v9.822c0 3.953-2.4 7.511-6.066 8.992"
        />
        <path
          fill="#DD2033"
          fillRule="evenodd"
          d="M32.4 32h-10v5.822a5.699 5.699 0 0 0 3.564 5.284 3.834 3.834 0 0 0 2.872 0 5.699 5.699 0 0 0 3.564-5.284V32Zm-14-4v9.822a9.7 9.7 0 0 0 6.065 8.992c1.883.76 3.987.76 5.87 0a9.699 9.699 0 0 0 6.065-8.992V28h-18Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default Portugal;
