import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type AndorraProps = CountrySymbolProps;

const Andorra = forwardRef<SVGSVGElement, AndorraProps>(function Andorra(
  props: AndorraProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Andorra"
      aria-label="andorra"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#004692" d="M0 0h22v72H0z" />
        <path fill="#FBD381" d="M22 0h28v72H22z" />
        <path
          fill="#DD2033"
          d="M50 0h22v72H50zM28 28h8v8h-8zm15.835 8H36v9.846A12.859 12.859 0 0 0 43.835 36Z"
        />
        <path
          fill="#FF9E42"
          fillRule="evenodd"
          d="M32 23v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10.941a16.86 16.86 0 0 1-8 14.344V52a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-3.715a16.86 16.86 0 0 1-8-14.344V23a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2Zm-4 5v5.941c0 5.228 3.165 9.932 8 11.905 4.835-1.973 8-6.677 8-11.905V28H28Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default Andorra;
