import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type HeardIslandAndMcdonaldIslandsProps = CountrySymbolProps;

const HeardIslandAndMcdonaldIslands = forwardRef<
  SVGSVGElement,
  HeardIslandAndMcdonaldIslandsProps
>(function HeardIslandAndMcdonaldIslands(
  props: HeardIslandAndMcdonaldIslandsProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="HeardIslandAndMcdonaldIslands"
      aria-label="heard island and mcdonald islands"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#004692" d="M0 0h72v72H0z" />
        <path
          fill="#F5F7F8"
          d="M55.23 17.64 54 15l-1.23 2.64-2.78-.66 1.245 2.633L49 21.431l2.782.643L51.776 25 54 23.17 56.225 25l-.008-2.926L59 21.431l-2.235-1.818 1.245-2.632-2.78.659ZM44 23l1.23 2.64 2.78-.66-1.245 2.633L49 29.431l-2.782.643.007 2.926L44 31.17 41.775 33l.008-2.926L39 29.431l2.235-1.818-1.245-2.632 2.78.659L44 23ZM29.215 48.751 27 44l-2.215 4.751-5.002-1.186 2.24 4.739L18 55.576l5.009 1.158L22.994 62 27 58.705 31.005 62l-.014-5.266L36 55.576l-4.023-3.272 2.24-4.739-5.002 1.186Zm23.262 1.416L51 47l-1.477 3.167-3.335-.79 1.494 3.159L45 54.717l3.339.772-.01 3.511L51 56.803 53.67 59l-.009-3.51L57 54.716l-2.682-2.181 1.494-3.16-3.335.791ZM64 25l1.23 2.64 2.78-.66-1.245 2.633L69 31.431l-2.782.643.007 2.926L64 33.17 61.775 35l.008-2.926L59 31.431l2.235-1.818-1.245-2.632 2.78.659L64 25Zm-7.5 16a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        />
        <mask id="b" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <path fill="#002F6C" d="M0 36C0 16.118 16.118 0 36 0v36H0Z" />
        </mask>
        <g mask="url(#b)">
          <path fill="#004692" d="M0 0h36v36H0z" />
          <path
            fill="#F5F7F8"
            d="m12.522 3.134-2.121 2.121 29.526 29.526 2.121-2.121L12.522 3.134ZM6.865 8.79 3.33 12.327l29.526 29.526 3.535-3.535L6.866 8.79Z"
          />
          <path
            fill="#DD2033"
            d="m6.865 8.79 3.536-3.535 29.526 29.526-3.535 3.536L6.864 8.79Z"
          />
          <path fill="#F5F7F8" d="M36 12v5H17v19h-5V12h24Z" />
          <path fill="#F5F7F8" d="M36-2v5H5v33H0V-2h36Z" />
          <path
            fill="#DD2033"
            fillRule="evenodd"
            d="M3 36h9V12h24V3H3v33Z"
            clipRule="evenodd"
          />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default HeardIslandAndMcdonaldIslands;
