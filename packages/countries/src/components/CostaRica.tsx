// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef, useState } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CostaRicaProps = CountrySymbolProps;

const CostaRica = forwardRef<SVGSVGElement, CostaRicaProps>(function CostaRica(
  props: CostaRicaProps,
  ref
) {
  const [uid] = useState(() => props.id || Math.random().toString());

  return (
    <CountrySymbol
      data-testid="CostaRica"
      aria-label="Costa Rica"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-CR-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        mask-type="alpha"
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-CR-a)`}>
        <path fill="#004692" d="M0 0h72v72H0z" />
        <path fill="#F5F7F8" d="M0 58V14h72v44z" />
        <path fill="#DD2033" d="M0 44V28h72v16z" />
      </g>
    </CountrySymbol>
  );
});

export default CostaRica;
