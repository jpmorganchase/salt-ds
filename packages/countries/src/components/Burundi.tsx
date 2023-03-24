import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BurundiProps = CountrySymbolProps;

export const Burundi = forwardRef<SVGSVGElement, BurundiProps>(function Burundi(
  props: BurundiProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Burundi"
      aria-label="burundi"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#009B77" d="m0 0 36 35L72 0v72L36 35 0 72V0Z" />
        <path fill="#A00009" d="m0 72 35-36L0 0h72L35 36l37 36H0Z" />
        <path
          fill="#F5F7F8"
          d="m58.6 6 6.364 6.364-12.41 12.41A19.907 19.907 0 0 1 56 36c0 3.57-.936 6.923-2.575 9.825l12.782 12.782-6.364 6.364-12.498-12.498A19.908 19.908 0 0 1 36 56c-4.161 0-8.026-1.27-11.226-3.446L12.619 64.71l-6.364-6.364 12.393-12.394A19.908 19.908 0 0 1 16 36c0-4.213 1.303-8.122 3.527-11.345L7.324 12.452l6.364-6.364 12.487 12.487A19.91 19.91 0 0 1 36 16c3.623 0 7.021.963 9.952 2.648L58.6 6Z"
        />
        <path
          fill="#A00009"
          d="m36.4 21-1.788 4.045-4.212.539 3.106 3.038L32.692 33l3.708-2.5 3.708 2.5-.814-4.378 3.106-3.038-4.212-.539L36.4 21Zm-10 13-1.788 4.045-4.212.539 3.106 3.038L22.692 46l3.708-2.5 3.708 2.5-.814-4.378 3.106-3.038-4.212-.539L26.4 34Zm19 0-1.788 4.045-4.212.539 3.106 3.038L41.692 46l3.708-2.5 3.708 2.5-.814-4.378 3.106-3.038-4.212-.539L45.4 34Z"
        />
      </g>
    </CountrySymbol>
  );
});
