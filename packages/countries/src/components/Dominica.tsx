import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type DominicaProps = CountrySymbolProps;

const Dominica = forwardRef<SVGSVGElement, DominicaProps>(function Dominica(
  props: DominicaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Dominica"
      aria-label="dominica"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#008259" d="M0 0h72v72H0z" />
        <path fill="#F5F7F8" d="M40 0h8v40h24v8H48v24h-8V48H0v-8h40V0Z" />
        <path fill="#FBD381" d="M24 0h8v24h40v8H32v40h-8V32H0v-8h24V0Z" />
        <path fill="#31373D" d="M40 0h-8v32H0v8h32v32h8V40h32v-8H40V0Z" />
        <circle cx="36.2" cy="36" r="20" fill="#DD2033" />
        <path fill="#005B33" d="M40.2 49h-4a6 6 0 0 1-6-6V32h10v17Z" />
        <path
          fill="#642F6C"
          d="M34.2 23h-2v9h-2v5c0 5.523 4.477 10 10 10V29a6 6 0 0 0-6-6Z"
        />
        <path fill="#FBD381" d="M32.2 23a3 3 0 0 0-3 3v2h3v-5Z" />
        <path
          fill="#008259"
          d="M37.2 32a3 3 0 0 1 3-3v4.948l3.573 10.401a6 6 0 0 1-3.726 7.624l-4.32-12.577A4.002 4.002 0 0 1 37.2 34.83V32Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Dominica;
