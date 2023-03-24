import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CookIslandsTheProps = CountrySymbolProps;

const CookIslandsThe = forwardRef<SVGSVGElement, CookIslandsTheProps>(
  function CookIslandsThe(props: CookIslandsTheProps, ref) {
    return (
      <CountrySymbol
        data-testid="CookIslandsThe"
        aria-label="cook islands (the)"
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
            d="m35.374 44.31-1.026 2.32-2.415.308 1.782 1.742-.468 2.51 2.127-1.433 2.126 1.434-.467-2.51 1.781-1.743-2.415-.309-1.025-2.32Zm2.579-6.385 1.026-2.32 1.026 2.32 2.415.309-1.782 1.742.468 2.51-2.127-1.433-2.126 1.433.467-2.51-1.782-1.742 2.416-.309Zm8.705-3.605L47.684 32l1.025 2.32 2.415.308-1.781 1.743.467 2.51-2.127-1.434-2.126 1.434.467-2.51-1.781-1.743 2.415-.308Zm-8.705 21.013 1.026-2.32 1.026 2.32 2.415.309-1.782 1.742.468 2.51-2.127-1.433-2.126 1.434.467-2.51-1.782-1.743 2.416-.309Zm9.731 1.286-1.026 2.32-2.415.308 1.781 1.743-.467 2.51 2.127-1.434L49.81 63.5l-.467-2.51 1.781-1.743-2.415-.308-1.026-2.32Zm7.678-1.286 1.025-2.32 1.026 2.32 2.415.309-1.782 1.742.468 2.51-2.127-1.433-2.126 1.434.467-2.51-1.781-1.743 2.415-.309Zm4.631-11.023-1.026 2.32-2.415.308 1.781 1.742-.467 2.51 2.127-1.433 2.126 1.434-.467-2.51 1.781-1.743-2.415-.309-1.025-2.32Zm-4.631-6.385 1.025-2.32 1.026 2.32 2.415.309-1.782 1.742.468 2.51-2.127-1.433-2.126 1.433.467-2.51-1.781-1.742 2.415-.309Z"
          />
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
        </g>
      </CountrySymbol>
    );
  }
);

export default CookIslandsThe;
