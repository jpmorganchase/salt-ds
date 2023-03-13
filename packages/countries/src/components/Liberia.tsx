import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type LiberiaProps = CountrySymbolProps;

export const Liberia = forwardRef<SVGSVGElement, LiberiaProps>(function Liberia(
  props: LiberiaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Liberia"
      aria-label="liberia"
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
          d="M72 18V9H0v9h72Zm0 9v9H0v-9h72Zm0 27v-9H0v9h72Zm0 18v-9H0v9h72Z"
        />
        <path fill="#004692" d="M.4 36V0h36v36z" />
        <path
          fill="#F5F7F8"
          d="m22.2 10-2.98 6.742-7.02.897 5.177 5.064L16.02 30l6.18-4.167L28.38 30l-1.357-7.297L32.2 17.64l-7.02-.897L22.2 10Z"
        />
      </g>
    </CountrySymbol>
  );
});
