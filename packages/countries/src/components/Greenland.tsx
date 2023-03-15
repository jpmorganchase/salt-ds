import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GreenlandProps = CountrySymbolProps;

const Greenland = forwardRef<SVGSVGElement, GreenlandProps>(function Greenland(
  props: GreenlandProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Greenland"
      aria-label="greenland"
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
          transform="rotate(180 36 36)"
        />
      </mask>
      <g mask="url(#a)">
        <path fill="#F5F7F8" d="M72 0v36H0V0z" />
        <path
          fill="#DD2033"
          d="M72 36v36H0V36zM30 20c-8.837 0-16 7.163-16 16h32c0-8.837-7.163-16-16-16Z"
        />
        <path
          fill="#F5F7F8"
          d="M30 52c-8.837 0-16-7.163-16-16h32c0 8.837-7.163 16-16 16Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Greenland;
