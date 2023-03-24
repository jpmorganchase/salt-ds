import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type NorthMacedoniaProps = CountrySymbolProps;

export const NorthMacedonia = forwardRef<SVGSVGElement, NorthMacedoniaProps>(
  function NorthMacedonia(props: NorthMacedoniaProps, ref) {
    return (
      <CountrySymbol
        data-testid="NorthMacedonia"
        aria-label="north macedonia"
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
            fill="#FBD381"
            d="M24.908 28.001a14.078 14.078 0 0 1 3.493-3.492L13.299 2.999l-9.9 9.9 21.51 15.102Zm8.691-5.721a14.07 14.07 0 0 1 4.826-.135L43-4H29l4.599 26.28Zm14.317 5.757a14.08 14.08 0 0 0-3.27-3.351L60.162 2.588l9.9 9.9-22.145 15.548Zm2.313 5.767a14.098 14.098 0 0 1-.086 4.877L76.25 43.25v-14l-26.021 4.554Zm-5.667 13.572a14.08 14.08 0 0 0 3.214-3.214l22.445 15.76-9.9 9.9-15.759-22.446Zm-6.222 2.491a14.13 14.13 0 0 1-4.656-.13L29 76.5h14l-4.66-26.633Zm-9.853-2.317a14.08 14.08 0 0 1-3.437-3.352L3.24 59.51l9.899 9.9 15.348-21.86Zm-5.857-9.004L-4.25 43.25v-14l26.8 4.69a14.118 14.118 0 0 0 .08 4.606ZM47.4 36c0 6.075-4.925 11-11 11s-11-4.925-11-11 4.925-11 11-11 11 4.925 11 11Z"
          />
        </g>
      </CountrySymbol>
    );
  }
);
