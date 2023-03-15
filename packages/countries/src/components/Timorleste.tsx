import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type TimorlesteProps = CountrySymbolProps;

const Timorleste = forwardRef<SVGSVGElement, TimorlesteProps>(
  function Timorleste(props: TimorlesteProps, ref) {
    return (
      <CountrySymbol
        data-testid="Timorleste"
        aria-label="timor-leste"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#DD2033" d="M0 0h72v72H0z" />
          <path fill="#FBD381" d="M66 36 0 0v72l66-36Z" />
          <path fill="#31373D" d="M48 36 0 0v72l48-36Z" />
          <path
            fill="#F5F7F8"
            d="m14.636 29.636 2.394 6.188-3.896 5.038 6.517-.072 3.78 5.507 1.281-6.585 6.585-1.281-5.507-3.78.072-6.517-5.038 3.896-6.188-2.394Z"
          />
        </g>
      </CountrySymbol>
    );
  }
);

export default Timorleste;
