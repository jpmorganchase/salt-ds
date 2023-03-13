import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type IranIslamicRepublicOfProps = CountrySymbolProps;

export const IranIslamicRepublicOf = forwardRef<
  SVGSVGElement,
  IranIslamicRepublicOfProps
>(function IranIslamicRepublicOf(props: IranIslamicRepublicOfProps, ref) {
  return (
    <CountrySymbol
      data-testid="IranIslamicRepublicOf"
      aria-label="iran (islamic republic of)"
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
          d="M5 50H0v22h72V50h-2v5h-5v-5h-5v5h-5v-5h-5v5h-5v-5h-5v5h-5v-5h-5v5h-5v-5h-5v5h-5v-5h-5v5H5v-5Z"
        />
        <path
          fill="#009B77"
          d="M0 0v17h5v5h5v-5h5v5h5v-5h5v5h5v-5h5v5h5v-5h5v5h5v-5h5v5h5v-5h5v5h7V0H0Z"
        />
        <path
          fill="#DD2033"
          d="M42.931 44A12.99 12.99 0 0 0 49 33c0-3.59-1.455-6.84-3.808-9.192l-2.626 2.626A9.257 9.257 0 0 1 45.286 33c0 4.492-3.19 8.24-7.429 9.1V27.429h-3.714V42.1c-4.239-.86-7.429-4.608-7.429-9.1a9.257 9.257 0 0 1 2.72-6.566l-2.626-2.626A12.96 12.96 0 0 0 23 33a12.99 12.99 0 0 0 6.069 11H27.6v3h17v-3h-1.669Zm-6.902-24h-.058.058Z"
        />
      </g>
    </CountrySymbol>
  );
});
