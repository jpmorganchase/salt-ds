import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SaintKittsAndNevisProps = CountrySymbolProps;

export const SaintKittsAndNevis = forwardRef<
  SVGSVGElement,
  SaintKittsAndNevisProps
>(function SaintKittsAndNevis(props: SaintKittsAndNevisProps, ref) {
  return (
    <CountrySymbol
      data-testid="SaintKittsAndNevis"
      aria-label="saint kitts and nevis"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#009B77" d="M0 0h72v72H0z" />
        <path fill="#DD2033" d="M72 72H0L72 0v72Z" />
        <path
          fill="#FBD381"
          d="m-.477 50.85 22.628 22.627L74.477 21.15 51.849-1.477z"
        />
        <path
          fill="#31373D"
          d="M17.908 69.054 3.766 54.912 55.061 3.617l14.142 14.142z"
        />
        <path
          fill="#F5F7F8"
          d="m16.857 44.77 2.128 5.5-3.463 4.478 5.793-.064 3.36 4.896 1.139-5.854 5.853-1.139-4.896-3.36.064-5.793-4.478 3.464-5.5-2.128ZM44.97 16.657l2.128 5.5-3.464 4.478 5.794-.064 3.36 4.896 1.139-5.854 5.853-1.139-4.896-3.36.064-5.793-4.478 3.464-5.5-2.128Z"
        />
      </g>
    </CountrySymbol>
  );
});
