import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BoliviaPlurinationalStateOfProps = CountrySymbolProps;

export const BoliviaPlurinationalStateOf = forwardRef<
  SVGSVGElement,
  BoliviaPlurinationalStateOfProps
>(function BoliviaPlurinationalStateOf(
  props: BoliviaPlurinationalStateOfProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="BoliviaPlurinationalStateOf"
      aria-label="bolivia (plurinational state of)"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#009B77" d="M0 72V50h72v22z" />
        <path fill="#FBD381" d="M0 50V22h72v28z" />
        <path fill="#DD2033" d="M0 22V0h72v22z" />
        <path
          fill="#936846"
          d="M35.998 38.5 33.4 37l-6 10.392 2.598 1.5 6-10.392Zm.402 0 2.598-1.5 6 10.392-2.598 1.5-6-10.392Z"
        />
        <path
          fill="#DD2033"
          d="m30 33-13-3v11.338a4 4 0 0 0 4.608 3.953L30 44V33Zm12 0 13-3v11.338a4 4 0 0 1-4.608 3.953L42 44V33Z"
        />
        <path
          fill="#A00009"
          d="m20 28 13 3v11l-8.392 1.291A4 4 0 0 1 20 39.338V28Zm32 0-13 3v11l8.392 1.291A4 4 0 0 0 52 39.338V28Z"
        />
        <path
          fill="#DD2033"
          d="m23 26 13 3 13-3v11.338a4 4 0 0 1-4.608 3.953L36 40l-8.392 1.291A4 4 0 0 1 23 37.338V26Z"
        />
        <path
          fill="#F1B434"
          d="M29.767 41.123 36 40l6.233 1.123a4 4 0 0 0 4.707-4.066l-.34-10.503L36 29l-10.6-2.446-.34 10.503a4 4 0 0 0 4.707 4.066Z"
        />
        <mask id="b" x="29" y="26" maskUnits="userSpaceOnUse" mask-type="alpha">
          <ellipse cx="36" cy="36" fill="#D9D9D9" rx="7" ry="10" />
        </mask>
        <g mask="url(#b)">
          <path
            fill="#FBD381"
            d="M42.588 44.218C41.063 46.396 38.765 48 36 48s-5.063-1.603-6.588-3.782C27.882 42.033 27 39.121 27 36c0-3.121.882-6.033 2.412-8.218C30.937 25.604 33.235 24 36 24s5.063 1.604 6.588 3.782C44.118 29.967 45 32.879 45 36c0 3.121-.882 6.033-2.412 8.218Z"
          />
          <path
            fill="#008259"
            d="M33.81 35.433a4 4 0 0 1 4.38 0l6.5 4.253c3.327 2.177 1.785 7.347-2.19 7.347h-13c-3.975 0-5.517-5.17-2.19-7.347l6.5-4.253Z"
          />
        </g>
        <path
          fill="#005EB8"
          fillRule="evenodd"
          d="M42.588 44.218C41.063 46.396 38.765 48 36 48s-5.063-1.603-6.588-3.782C27.882 42.033 27 39.121 27 36c0-3.121.882-6.033 2.412-8.218C30.937 25.604 33.235 24 36 24s5.063 1.604 6.588 3.782C44.118 29.967 45 32.879 45 36c0 3.121-.882 6.033-2.412 8.218ZM36 46c3.866 0 7-4.477 7-10s-3.134-10-7-10-7 4.477-7 10 3.134 10 7 10Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});
