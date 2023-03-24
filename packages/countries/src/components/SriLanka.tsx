import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SriLankaProps = CountrySymbolProps;

export const SriLanka = forwardRef<SVGSVGElement, SriLankaProps>(
  function SriLanka(props: SriLankaProps, ref) {
    return (
      <CountrySymbol
        data-testid="SriLanka"
        aria-label="sri lanka"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#F1B434" d="M0 0h72v72H0z" />
          <path fill="#E26E00" d="M14.2 6h16v60h-16z" />
          <path fill="#005B33" d="M-1.8 6h16v60h-16z" />
          <path
            fill="#A00009"
            fillRule="evenodd"
            d="M72.2 6h-36v60h36V45.331a6.27 6.27 0 0 1-1.154.105h-9.538V51h-5.564v-3.18h2.384v-2.846a6.383 6.383 0 0 1-3.32-3.086l-3.039-1.754v3.712a1.59 1.59 0 0 1-3.18 0v-7.949H47.2v-.794h1.59V23.178A3.18 3.18 0 0 1 51.97 20v15.545l2.697 1.557a6.362 6.362 0 0 1 6.046-4.384h10.333c.394 0 .78.036 1.154.104V6Zm-9.5 19.564 2.782-2.782v9.936H54.354v-1.514l-.217.051-.25-2.537.467.205v-3.359H62.7Z"
            clipRule="evenodd"
          />
        </g>
      </CountrySymbol>
    );
  }
);
