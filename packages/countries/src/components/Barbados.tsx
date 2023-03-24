import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type BarbadosProps = CountrySymbolProps;

const Barbados = forwardRef<SVGSVGElement, BarbadosProps>(function Barbados(
  props: BarbadosProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Barbados"
      aria-label="barbados"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle
          cx="36"
          cy="36"
          r="36"
          fill="#D9D9D9"
          transform="rotate(-90 36 36)"
        />
      </mask>
      <g mask="url(#a)">
        <path fill="#004692" d="M72 72H0V0h72z" />
        <path fill="#F1B434" d="M52 72H20V0h32z" />
        <path
          fill="#31373D"
          d="m47.346 23.364-2.252-1.129c-.136.273-3.075 6.267-3.556 15.424h-3.422V23.364L35.599 20l-2.518 3.364v14.295H29.66c-.48-9.157-3.42-15.151-3.556-15.424L21.6 24.492c.031.062 3.09 6.303 3.09 15.69v2.523h8.391V53h5.035V42.705h8.39v-2.523c0-4.853.839-8.855 1.542-11.358.766-2.729 1.544-4.322 1.552-4.338l-2.254-1.122Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Barbados;
