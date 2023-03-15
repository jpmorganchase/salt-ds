import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type OmanProps = CountrySymbolProps;

const Oman = forwardRef<SVGSVGElement, OmanProps>(function Oman(
  props: OmanProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Oman"
      aria-label="oman"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 0h72v72H0z" />
        <path fill="#005B33" d="M37 72V48h35v24z" />
        <path
          fill="#F5F7F8"
          d="M37 24V0h35v24zm-21.55-9.192-4.242 4.242 4.95 4.95-4.95 4.95 4.242 4.242 4.95-4.95 4.95 4.95 4.242-4.242-4.95-4.95 4.95-4.95-4.242-4.242-4.95 4.95-4.95-4.95Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Oman;
