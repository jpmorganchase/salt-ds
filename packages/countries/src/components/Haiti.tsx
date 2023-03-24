import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type HaitiProps = CountrySymbolProps;

export const Haiti = forwardRef<SVGSVGElement, HaitiProps>(function Haiti(
  props: HaitiProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Haiti"
      aria-label="haiti"
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
        <path fill="#004692" d="M72 0v36H0V0z" />
        <path fill="#DD2033" d="M72 36v36H0V36z" />
        <path fill="#F5F7F8" d="M20 21h32v30H20z" />
        <path
          fill="#004692"
          d="M34.607 50.691a9.432 9.432 0 0 1-2.232-.477 9.464 9.464 0 0 1-3.898-1.237A9.5 9.5 0 0 1 25 36l1.446.835a9.473 9.473 0 0 1 2.048-3.048l1.378 1.379a9.49 9.49 0 0 1 2.344-1.905l3.922 6.794L40.21 33a9.5 9.5 0 0 1 2.172 1.717l.992-.993c.931.93 1.64 2 2.128 3.14L47 36c2.761 4.783 1.123 10.899-3.66 13.66a9.954 9.954 0 0 1-5.769 1.311 9.527 9.527 0 0 1-2.964-.28Z"
        />
        <path fill="#008259" d="m20 51 11.61-7.62a8 8 0 0 1 8.78 0L52 51H20Z" />
        <path fill="#936846" d="M35.4 30h2v14h-2z" />
        <path
          fill="#009B77"
          d="m36.9 23 1.6 3.431 3.613-.856-1.618 3.422L43.4 31.36l-3.617.837.01 3.803-2.893-2.38L34.007 36l.01-3.803-3.617-.837 2.905-2.363-1.618-3.422 3.613.856L36.9 23Z"
        />
      </g>
    </CountrySymbol>
  );
});
