// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef, useState } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SaudiArabiaProps = CountrySymbolProps;

const SaudiArabia = forwardRef<SVGSVGElement, SaudiArabiaProps>(
  function SaudiArabia(props: SaudiArabiaProps, ref) {
    const [uid] = useState(() => props.id || Math.random().toString());

    return (
      <CountrySymbol
        data-testid="SaudiArabia"
        aria-label="Saudi Arabia"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask
          id={`${uid}-SA-a`}
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask={`url(#${uid}-SA-a)`}>
          <path fill="#005B33" d="M0 0h72v72H0z" />
          <path
            fill="#F5F7F8"
            d="M15.472 31.15A3.476 3.476 0 0 1 12 34.624v5.207c4.786 0 8.68-3.893 8.68-8.68V19h-5.208v12.15ZM52.792 19v12.15a3.476 3.476 0 0 1-3.471 3.473v5.207c4.785 0 8.679-3.893 8.679-8.68V19h-5.208Z"
          />
          <path
            fill="#F5F7F8"
            d="M50.188 19h-5.207v12.15h5.207V19ZM37.17 25.943a.869.869 0 0 1-1.736 0V19h-5.208v6.943a.869.869 0 0 1-1.735 0V19h-5.208v6.943a6.082 6.082 0 0 0 6.076 6.076c1.29 0 2.486-.405 3.471-1.094a6.04 6.04 0 0 0 4.239 1.044 3.475 3.475 0 0 1-3.37 2.654v5.207c4.785 0 8.678-3.893 8.678-8.68V19H37.17v6.943Z"
          />
          <path
            fill="#F5F7F8"
            d="M31.094 34.623h-7.811v5.207h7.811v-5.207ZM50.144 50H55v3h-4.856a4.502 4.502 0 0 1-8.488 0H17v-3h24.656a4.502 4.502 0 0 1 8.488 0Z"
          />
        </g>
      </CountrySymbol>
    );
  }
);

export default SaudiArabia;
