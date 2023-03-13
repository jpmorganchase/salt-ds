import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type AnguillaProps = CountrySymbolProps;

export const Anguilla = forwardRef<SVGSVGElement, AnguillaProps>(
  function Anguilla(props: AnguillaProps, ref) {
    return (
      <CountrySymbol
        data-testid="Anguilla"
        aria-label="anguilla"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#004692" d="M0 0h72v72H0z" />
          <mask id="b" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
            <path fill="#002F6C" d="M0 36C0 16.118 16.118 0 36 0v36H0Z" />
          </mask>
          <g mask="url(#b)">
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
          <path
            fill="#F5F7F8"
            d="M41.2 35h21v8.743a14.857 14.857 0 0 1-9.36 13.803L51.7 58l-1.14-.454a14.857 14.857 0 0 1-9.36-13.803V35Z"
          />
          <mask
            id="c"
            x="41"
            y="50"
            maskUnits="userSpaceOnUse"
            mask-type="alpha"
          >
            <path fill="#D9D9D9" d="M41.2 50h22v8h-22z" />
          </mask>
          <g mask="url(#c)">
            <path
              fill="#3CCBDA"
              d="M41.2 35h21v8.743a14.857 14.857 0 0 1-9.36 13.803L51.7 58l-1.14-.454a14.857 14.857 0 0 1-9.36-13.803V35Z"
            />
          </g>
          <circle cx="48.7" cy="43.5" r="2.5" fill="#FF9E42" />
          <circle cx="53.7" cy="39.5" r="2.5" fill="#FF9E42" />
          <circle cx="55.7" cy="45.5" r="2.5" fill="#FF9E42" />
        </g>
      </CountrySymbol>
    );
  }
);
