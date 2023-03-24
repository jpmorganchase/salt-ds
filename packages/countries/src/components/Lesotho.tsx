import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type LesothoProps = CountrySymbolProps;

export const Lesotho = forwardRef<SVGSVGElement, LesothoProps>(function Lesotho(
  props: LesothoProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Lesotho"
      aria-label="lesotho"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#009B77" d="M0 72V52h72v20z" />
        <path fill="#F5F7F8" d="M0 52V20h72v32z" />
        <path fill="#004692" d="M0 20V0h72v20z" />
        <mask id="b" x="28" y="32" maskUnits="userSpaceOnUse" mask-type="alpha">
          <path
            fill="#D9D9D9"
            d="m35.767 48.158-7.693-7.693 7.693-7.692 7.692 7.692z"
          />
        </mask>
        <g fill="#31373D" mask="url(#b)">
          <circle
            cx="35.767"
            cy="32.773"
            r="10.879"
            transform="rotate(-135 35.767 32.773)"
          />
          <circle
            cx="35.767"
            cy="32.773"
            r="10.879"
            transform="rotate(-135 35.767 32.773)"
          />
        </g>
        <mask id="c" x="23" y="30" maskUnits="userSpaceOnUse" mask-type="alpha">
          <path
            fill="#D9D9D9"
            d="m23.8 42.96 12.04-12.04 12.04 12.04L35.84 55 23.8 42.96Z"
          />
        </mask>
        <g mask="url(#c)">
          <path
            fill="#31373D"
            fillRule="evenodd"
            d="M43.442 40.396c4.248-4.249 4.248-11.137 0-15.386-4.249-4.248-11.137-4.248-15.386 0-4.248 4.25-4.248 11.137 0 15.386 4.249 4.248 11.137 4.248 15.386 0Zm2.564 2.564c5.665-5.665 5.665-14.849 0-20.514-5.665-5.665-14.85-5.665-20.514 0-5.665 5.665-5.665 14.85 0 20.514 5.665 5.665 14.85 5.665 20.514 0Z"
            clipRule="evenodd"
          />
        </g>
        <path fill="#31373D" d="M33.8 24h4v11h-4z" />
      </g>
    </CountrySymbol>
  );
});
