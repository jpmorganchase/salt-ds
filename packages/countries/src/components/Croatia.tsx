import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CroatiaProps = CountrySymbolProps;

export const Croatia = forwardRef<SVGSVGElement, CroatiaProps>(function Croatia(
  props: CroatiaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Croatia"
      aria-label="croatia"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#004692" d="M0 72V48h72v24z" />
        <path fill="#F5F7F8" d="M0 48V24h72v24z" />
        <path fill="#DD2033" d="M0 24V0h72v24z" />
        <path
          fill="#F5F7F8"
          d="M22 24h28v16c0 7.732-6.268 14-14 14s-14-6.268-14-14V24Z"
        />
        <mask id="b" x="22" y="24" maskUnits="userSpaceOnUse" mask-type="alpha">
          <path
            fill="#F5F7F8"
            d="M22 24h28v16c0 7.732-6.268 14-14 14s-14-6.268-14-14V24Z"
          />
        </mask>
        <g mask="url(#b)">
          <path
            fill="#DD2033"
            fillRule="evenodd"
            d="M29 24h-7v7h7v7h-7v7h7v7h-7v7h7v-7h7v7h7v-7h7v-7h-7v-7h7v-7h-7v-7h-7v7h-7v-7Zm7 14h7v-7h-7v7Zm0 7h-7v-7h7v7Zm0 0h7v7h-7v-7Z"
            clipRule="evenodd"
          />
        </g>
        <path fill="#0091DA" d="m22 17 4.5-3 4.5 3v7h-9v-7Z" />
        <path fill="#004692" d="m31 17 5-3 5 3v7H31v-7Z" />
        <path fill="#0091DA" d="m41 17 4.5-3 4.5 3v7h-9v-7Z" />
      </g>
    </CountrySymbol>
  );
});
