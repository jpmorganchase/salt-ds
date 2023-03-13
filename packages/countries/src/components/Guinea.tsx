import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GuineaProps = CountrySymbolProps;

export const Guinea = forwardRef<SVGSVGElement, GuineaProps>(function Guinea(
  props: GuineaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Guinea"
      aria-label="guinea"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle
          cx="36"
          cy="36"
          r="36"
          fill="#D9D9D9"
          transform="matrix(0 -1 -1 0 72 72)"
        />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 72h24V0H0z" />
        <path fill="#FBD381" d="M24 72h24V0H24z" />
        <path fill="#009B77" d="M48 72h24V0H48z" />
      </g>
    </CountrySymbol>
  );
});
