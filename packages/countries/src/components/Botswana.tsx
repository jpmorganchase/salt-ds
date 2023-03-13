import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BotswanaProps = CountrySymbolProps;

export const Botswana = forwardRef<SVGSVGElement, BotswanaProps>(
  function Botswana(props: BotswanaProps, ref) {
    return (
      <CountrySymbol
        data-testid="Botswana"
        aria-label="botswana"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#86C5FA" d="M0 72V0h72v72z" />
          <path fill="#F5F7F8" d="M0 48V24h72v24z" />
          <path fill="#31373D" d="M0 42V30h72v12z" />
        </g>
      </CountrySymbol>
    );
  }
);
