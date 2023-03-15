import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GermanyProps = CountrySymbolProps;

const Germany = forwardRef<SVGSVGElement, GermanyProps>(function Germany(
  props: GermanyProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Germany"
      aria-label="germany"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#F1B434" d="M0 72V48h72v24z" />
        <path fill="#DD2033" d="M0 48V24h72v24z" />
        <path fill="#31373D" d="M0 24V0h72v24z" />
      </g>
    </CountrySymbol>
  );
});

export default Germany;
