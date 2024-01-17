// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef, useState } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type PEProps = CountrySymbolProps;

const PE = forwardRef<SVGSVGElement, PEProps>(function PE(props: PEProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="PE"
      aria-label="Peru"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-PE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle
          cx="36"
          cy="36"
          r="36"
          fill="#D9D9D9"
          transform="rotate(-90 36 36)"
        />
      </mask>
      <g mask={`url(#${uid}-PE-a)`}>
        <path fill="#DD2033" d="M0 0h72v72H0z" />
        <path fill="#F5F7F8" d="M56 72H16V0h40z" />
        <path
          fill="#009B77"
          fillRule="evenodd"
          d="M18.406 35.435a18.073 18.073 0 0 0-.406 3.82c0 9.94 8.059 18 18 18s18-8.06 18-18c0-1.34-.146-2.644-.423-3.899l-5.663 2.45c.057.474.086.958.086 1.449 0 6.627-5.373 12-12 12s-12-5.373-12-12c0-.463.026-.919.077-1.367l-5.67-2.453Z"
          clipRule="evenodd"
        />
        <path
          fill="#FF9E42"
          d="M26.2 20h20v7.941a14.857 14.857 0 0 1-9.34 13.795L36.2 42l-.66-.264A14.857 14.857 0 0 1 26.2 27.94V20Z"
        />
        <mask
          id={`${uid}-PE-b`}
          x="26"
          y="20"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path
            fill="#005EB8"
            d="M26.2 20h20v7.941a14.857 14.857 0 0 1-9.34 13.795L36.2 42l-.66-.264A14.857 14.857 0 0 1 26.2 27.94V20Z"
          />
        </mask>
        <g mask={`url(#${uid}-PE-b)`}>
          <path fill="#DD2033" d="M26.2 30h20v12h-20z" />
          <path fill="#0091DA" d="M26.2 20h10v10h-10z" />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default PE;
