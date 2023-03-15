import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MalawiProps = CountrySymbolProps;

const Malawi = forwardRef<SVGSVGElement, MalawiProps>(function Malawi(
  props: MalawiProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Malawi"
      aria-label="malawi"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#009B77" d="M0 72V48h72v24z" />
        <path fill="#DD2033" d="M0 48V24h72v24z" />
        <path fill="#31373D" d="M0 24V0h72v24z" />
        <path
          fill="#DD2033"
          d="M49 20H23l5.312-2.627-2.829-5.407 5.768 1.16L31.983 7 36 11.505 40.018 7l.73 6.125 5.769-1.16-2.829 5.409L49 20Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Malawi;
