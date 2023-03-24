import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type IsleOfManProps = CountrySymbolProps;

export const IsleOfMan = forwardRef<SVGSVGElement, IsleOfManProps>(
  function IsleOfMan(props: IsleOfManProps, ref) {
    return (
      <CountrySymbol
        data-testid="IsleOfMan"
        aria-label="isle of man"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#DD2033" d="M0 0h72v72H0z" />
          <path
            fill="#F5F7F8"
            d="M18.134 26.96c-.542.383-1.3.22-1.632-.348L12 18.899 13.586 18l5.393 5.038 13.628-4.91c1.023-.37 2.148.195 2.449 1.226l.06.208 4.266 10.874.36.294.014-.026 6.106 3.195.39-1.769c.218-.985.551-1.943.994-2.852l2.76-5.669-.18-2.219a1.117 1.117 0 0 1 1.145-1.197l9.029.172-.035 1.802-7.162 1.958-2.75 14.038c-.205 1.054-1.276 1.714-2.328 1.436l-.211-.056-11.706-2.008.015-.027h-.328l.02.03-5.771 3.753 1.389 1.184c.774.66 1.468 1.407 2.066 2.225l3.729 5.102 2.063.907c.608.267.85.993.52 1.563L35.033 60l-1.589-.893 1.684-7.133-11.192-9.1a1.83 1.83 0 0 1-.164-2.701l.15-.157 7.396-9.164.022.036.097-.222h-.014l-.367-6.802-1.74.582c-.969.324-1.974.536-2.993.63l-6.353.59-1.837 1.295Z"
          />
        </g>
      </CountrySymbol>
    );
  }
);
