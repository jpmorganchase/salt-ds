import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type TaiwanProvinceOfChinaProps = CountrySymbolProps;

export const TaiwanProvinceOfChina = forwardRef<
  SVGSVGElement,
  TaiwanProvinceOfChinaProps
>(function TaiwanProvinceOfChina(props: TaiwanProvinceOfChinaProps, ref) {
  return (
    <CountrySymbol
      data-testid="TaiwanProvinceOfChina"
      aria-label="taiwan (province of china)"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 72V0h72v72z" />
        <path fill="#004692" d="M0 44V0h44v44z" />
        <path
          fill="#F5F7F8"
          d="m34 25-4.495 2.223 2.394 4.576-4.881-.982L26.4 36 23 32.188 19.6 36l-.618-5.183-4.88.981 2.393-4.576L12 25l4.495-2.223-2.394-4.575 4.88.981.62-5.183L23 17.812 26.4 14l.618 5.183 4.88-.981-2.393 4.576L34 25Z"
        />
      </g>
    </CountrySymbol>
  );
});
