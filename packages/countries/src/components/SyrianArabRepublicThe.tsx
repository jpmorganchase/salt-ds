import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SyrianArabRepublicTheProps = CountrySymbolProps;

export const SyrianArabRepublicThe = forwardRef<
  SVGSVGElement,
  SyrianArabRepublicTheProps
>(function SyrianArabRepublicThe(props: SyrianArabRepublicTheProps, ref) {
  return (
    <CountrySymbol
      data-testid="SyrianArabRepublicThe"
      aria-label="syrian arab republic (the)"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#31373D" d="M0 72V48h72v24z" />
        <path fill="#F5F7F8" d="M0 48V24h72v24z" />
        <path
          fill="#009B77"
          d="M16.212 34.045 18 30l1.788 4.045 4.212.539-3.106 3.038.814 4.378L18 39.5 14.292 42l.814-4.378L12 34.584l4.212-.539Zm36 0L54 30l1.788 4.045 4.212.539-3.106 3.038.814 4.378L54 39.5 50.292 42l.814-4.378L48 34.584l4.212-.539Z"
        />
        <path fill="#DD2033" d="M0 24V0h72v24z" />
      </g>
    </CountrySymbol>
  );
});
