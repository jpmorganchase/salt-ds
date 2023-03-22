// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef, useState } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BulgariaProps = CountrySymbolProps;

const Bulgaria = forwardRef<SVGSVGElement, BulgariaProps>(function Bulgaria(
  props: BulgariaProps,
  ref
) {
  const [uid] = useState(() => props.id || Math.random().toString());

  return (
    <CountrySymbol
      data-testid="Bulgaria"
      aria-label="Bulgaria"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-BG-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        mask-type="alpha"
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-BG-a)`}>
        <path fill="#DD2033" d="M0 72V48h72v24z" />
        <path fill="#009B77" d="M0 48V24h72v24z" />
        <path fill="#F5F7F8" d="M0 24V0h72v24z" />
      </g>
    </CountrySymbol>
  );
});

export default Bulgaria;
