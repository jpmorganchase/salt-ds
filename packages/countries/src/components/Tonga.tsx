import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type TongaProps = CountrySymbolProps;

export const Tonga = forwardRef<SVGSVGElement, TongaProps>(function Tonga(
  props: TongaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Tonga"
      aria-label="tonga"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 72V0h72v72z" />
        <path
          fill="#F5F7F8"
          fillRule="evenodd"
          d="M-.2 0v44h44V0h-44ZM21 14h6v7h7v6h-7v7h-6v-7h-7v-6h7v-7Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});
