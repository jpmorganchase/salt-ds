// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type NorwayProps = CountrySymbolProps;

const Norway = forwardRef<SVGSVGElement, NorwayProps>(function Norway(
  props: NorwayProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Norway"
      aria-label="norway"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 0h72v72H0z" />
        <path
          fill="#F5F7F8"
          fillRule="evenodd"
          d="M20.4 72h-6V47.7H.4v-6h14V30.3H.4v-6h14V0h6v24.3h11.4V0h6v24.3h34.6v6H37.8v11.4h34.6v6H37.8V72h-6V47.7H20.4V72Zm11.4-41.7H20.4v11.4h11.4V30.3Z"
          clipRule="evenodd"
        />
        <path fill="#004692" d="M20 72h12V42h40V30H32V0H20v30H0v12h20v30Z" />
      </g>
    </CountrySymbol>
  );
});

export default Norway;
