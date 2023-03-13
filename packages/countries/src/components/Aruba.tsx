import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type ArubaProps = CountrySymbolProps;

export const Aruba = forwardRef<SVGSVGElement, ArubaProps>(function Aruba(
  props: ArubaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Aruba"
      aria-label="aruba"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#0091DA" d="M0 0h72v72H0z" />
        <path
          fill="#DD2033"
          d="m24 14 3.674 8.326L36 26l-8.326 3.674L24 38l-3.674-8.326L12 26l8.326-3.674L24 14Z"
        />
        <path
          fill="#F5F7F8"
          fillRule="evenodd"
          d="m24 7.631 5.624 12.744L42.37 26l-12.745 5.625L24 44.368l-5.625-12.744L5.631 26l12.744-5.625L24 7.631Zm-3.674 14.695L12 26l8.326 3.674L24 38l3.674-8.326L36 26l-8.326-3.674L24 14l-3.674 8.326Z"
          clipRule="evenodd"
        />
        <path fill="#FBD381" d="M0 48h72v6H0zm0 12h72v6H0z" />
      </g>
    </CountrySymbol>
  );
});
