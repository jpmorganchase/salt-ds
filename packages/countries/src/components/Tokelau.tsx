import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type TokelauProps = CountrySymbolProps;

const Tokelau = forwardRef<SVGSVGElement, TokelauProps>(function Tokelau(
  props: TokelauProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Tokelau"
      aria-label="tokelau"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#004692" d="M0 0h72v72H0z" />
        <path
          fill="#F5F7F8"
          d="m22.2 36-2.086 4.72-4.914.627 3.624 3.545-.95 5.108 4.326-2.917L26.526 50l-.95-5.108 3.624-3.545-4.913-.628L22.2 36Zm-8-15-1.49 3.371-3.51.449 2.589 2.532L11.11 31l3.09-2.083L17.29 31l-.678-3.648L19.2 24.82l-3.51-.449L14.2 21Zm8-12-1.49 3.371-3.51.449 2.589 2.532L19.11 19l3.09-2.083L25.29 19l-.678-3.648L27.2 12.82l-3.51-.449L22.2 9Zm9 10-1.49 3.371-3.51.449 2.589 2.532L28.11 29l3.09-2.083L34.29 29l-.678-3.648L36.2 22.82l-3.51-.449L31.2 19Z"
        />
        <path
          fill="#F1B434"
          d="M36.2 44h37v6h-37v-6Zm38-3h-38c13.376-15.326 30.907-25.053 38-28v28Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Tokelau;
