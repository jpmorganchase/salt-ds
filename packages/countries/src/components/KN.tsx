// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type KNProps = CountrySymbolProps;

const KN = forwardRef<SVGSVGElement, KNProps>(function KN(props: KNProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="KN"
      aria-label="Saint Kitts and Nevis"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-KN-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-KN-a)`}>
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

export default KN;
