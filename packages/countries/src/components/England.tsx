import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type EnglandProps = CountrySymbolProps;

export const England = forwardRef<SVGSVGElement, EnglandProps>(function England(
  props: EnglandProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="England"
      aria-label="england"
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
          d="M30.4 72h12V42H72V30H42.4V0h-12v30H0v12h30.4v30Z"
        />
      </g>
    </CountrySymbol>
  );
});
