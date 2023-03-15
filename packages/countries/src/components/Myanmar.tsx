import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MyanmarProps = CountrySymbolProps;

const Myanmar = forwardRef<SVGSVGElement, MyanmarProps>(function Myanmar(
  props: MyanmarProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Myanmar"
      aria-label="myanmar"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 72V48h72v24z" />
        <path fill="#009B77" d="M0 48V24h72v24z" />
        <path fill="#FBD381" d="M0 24V0h72v24z" />
        <path
          fill="#F5F7F8"
          d="m36 18-5.365 12.136L18 31.75l9.32 9.115L24.874 54 36 46.5 47.125 54 44.68 40.866 54 31.751l-12.635-1.615L36 18Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Myanmar;
