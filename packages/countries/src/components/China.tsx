import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type ChinaProps = CountrySymbolProps;

export const China = forwardRef<SVGSVGElement, ChinaProps>(function China(
  props: ChinaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="China"
      aria-label="china"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 0h72v72H0z" />
        <path
          fill="#F1B434"
          d="m39.553 4.805-2.775 3.444-4.207-.57 2.214 3.739-1.92 4.018 4.23-1.455 2.934 3.374.346-4.44 3.787-2.13-3.929-1.61-.68-4.37ZM20 19.6l-3.279 7.416L9 28.003l5.695 5.57-1.494 8.027L20 37.017l6.799 4.583-1.494-8.026L31 28.004l-7.721-.988L20 19.6Zm23.767 4.575.68-4.37 2.774 3.444 4.208-.57-2.214 3.739 1.92 4.018-4.23-1.455-2.934 3.374-.346-4.44-3.787-2.13 3.929-1.61ZM44 34.6l-1.788 4.045-4.212.539 3.106 3.038-.814 4.378L44 44.1l3.708 2.5-.814-4.378L50 39.184l-4.212-.539L44 34.6ZM32.778 50.25l2.775-3.446.68 4.37 3.93 1.61-3.788 2.132-.346 4.44-2.935-3.375-4.229 1.455 1.92-4.018-2.214-3.739 4.207.57Z"
        />
      </g>
    </CountrySymbol>
  );
});
