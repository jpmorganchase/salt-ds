// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MXProps = CountrySymbolProps;

const MX = forwardRef<SVGSVGElement, MXProps>(function MX(props: MXProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="MX"
      aria-label="Mexico"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-MX-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-MX-a)`}>
        <path fill="#DD2033" d="M56 0h16v72H56z" />
        <path fill="#F5F7F8" d="M16 0h40v72H16z" />
        <path fill="#008259" d="M0 0h16v72H0z" />
        <path
          fill="#009B77"
          fillRule="evenodd"
          d="M18.406 35.435a18.074 18.074 0 0 0-.406 3.82c0 9.94 8.059 18 18 18s18-8.06 18-18c0-1.339-.146-2.644-.423-3.899l-5.663 2.45c.057.474.086.958.086 1.449 0 6.627-5.373 12-12 12s-12-5.373-12-12c0-.463.026-.919.077-1.367l-5.67-2.453Z"
          clipRule="evenodd"
        />
        <path
          fill="#936846"
          d="m42.8 28 2.353 4.04a2.05 2.05 0 0 1-.726 2.795l-.47-.791c-.03.173-.067.344-.11.514l.291.49a2.034 2.034 0 0 1-.71 2.787l-.627-1.056a5.88 5.88 0 0 1-.132.168 2.034 2.034 0 0 1-.765 2.69l-.806-1.358-.004.002-.154-.267-3.386-5.706.656 5.102L42.8 42h-8.53a4 4 0 0 1-3.96-3.434l-.838-5.866-2.98.876-.564-1.92a4 4 0 0 1 2.71-4.965l1.919-.563a4.002 4.002 0 0 1 4.445 1.601l-.202-.35c-.552-.956-.23-2.227.84-2.502 2.718-.698 5.11.664 7.16 3.123Z"
        />
        <path
          fill="#F1B434"
          d="m25.882 31.5.61 2.076 3.008-.884-3.618-1.192Z"
        />
        <path
          fill="#008259"
          fillRule="evenodd"
          d="M26.503 38.875c-2.326-4.008-4.66-6.08-5.498-6.603l1.59-2.544c1.365.853 4.008 3.342 6.503 7.64l-2.595 1.507Zm8.47 7.932c-2.696-.23-5.392-1.659-7.032-5.172l2.718-1.27c1.16 2.487 2.881 3.309 4.569 3.453 1.809.155 3.683-.476 4.837-1.125l1.47 2.614c-1.512.851-3.988 1.72-6.563 1.5Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default MX;
