import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SouthGeorgiaAndTheSouthSandwichIslandsProps = CountrySymbolProps;

const SouthGeorgiaAndTheSouthSandwichIslands = forwardRef<
  SVGSVGElement,
  SouthGeorgiaAndTheSouthSandwichIslandsProps
>(function SouthGeorgiaAndTheSouthSandwichIslands(
  props: SouthGeorgiaAndTheSouthSandwichIslandsProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="SouthGeorgiaAndTheSouthSandwichIslands"
      aria-label="south georgia and the south sandwich islands"
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
          transform="rotate(-90 36 36)"
        />
      </mask>
      <g mask="url(#a)">
        <path fill="#004692" d="M0 0h72v72H0z" />
        <path fill="#C1C3C3" d="M46.4 26.8h9v8h-9z" />
        <path fill="#936846" d="M47.4 19.8h2.5v3h3.5v4h-6v-7Z" />
        <path fill="#FBD381" d="M61.4 52.8h-21v5h3v3h15v-3h3v-5Z" />
        <path
          fill="#F5F7F8"
          d="M40.4 34.8h21v8.743a14.857 14.857 0 0 1-9.36 13.803l-1.14.454-1.14-.454a14.857 14.857 0 0 1-9.36-13.803V34.8Z"
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
      <mask id="c" x="40" y="34" maskUnits="userSpaceOnUse" mask-type="alpha">
        <path
          fill="#F5F7F8"
          d="M40.4 34.8h21v8.743a14.857 14.857 0 0 1-9.36 13.803l-1.14.454-1.14-.454a14.857 14.857 0 0 1-9.36-13.803V34.8Z"
        />
      </mask>
      <g fill="#005EB8" mask="url(#c)">
        <path d="m50.65 34.3 4.75 4.75-4.75 4.75-4.75-4.75 4.75-4.75Zm-9.5 9.5 4.75 4.75-4.75 4.75-4.75-4.75 4.75-4.75Zm23.75-4.75-4.75-4.75-4.75 4.75 4.75 4.75 4.75-4.75ZM50.65 43.8l4.75 4.75-4.75 4.75 4.75 4.75-4.75 4.75-4.75-4.75 4.75-4.75-4.75-4.75 4.75-4.75Zm-4.75-4.75-4.75-4.75-4.75 4.75 4.75 4.75 4.75-4.75Zm14.25 4.75 4.75 4.75-4.75 4.75-4.75-4.75 4.75-4.75Z" />
      </g>
    </CountrySymbol>
  );
});

export default SouthGeorgiaAndTheSouthSandwichIslands;
