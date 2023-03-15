import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MacaoProps = CountrySymbolProps;

const Macao = forwardRef<SVGSVGElement, MacaoProps>(function Macao(
  props: MacaoProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Macao"
      aria-label="macao"
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
        <path fill="#008259" d="M72 72H0V0h72z" />
        <mask id="b" x="11" y="12" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="35.6" cy="36" r="24" fill="#D9D9D9" />
        </mask>
        <g mask="url(#b)">
          <path
            fill="#F5F7F8"
            fillRule="evenodd"
            d="M64 57H7v3h57v-3Zm1.6-6h-57v3h57v-3Z"
            clipRule="evenodd"
          />
        </g>
        <path
          fill="#F5F7F8"
          d="M40.511 37.089c1.825-3.256 2.04-7.877-4.853-13.089-6.944 5.276-6.813 9.848-5.013 13.064-3.252-1.802-7.856-1.983-13.045 4.878 10.134 13.339 17.671.571 17.99.018l.031.019c.448.77 7.94 13.178 17.98-.037-5.212-6.892-9.834-6.678-13.09-4.853Z"
        />
        <path
          fill="#F1B434"
          d="m35.205 12-1.104 2.497-2.6.332 1.918 1.876-.503 2.702 2.29-1.543 2.288 1.543-.503-2.702 1.918-1.876-2.6-.332L35.205 12Zm-12.841 4.374.528 2.678-1.939 1.764 2.647.436 1.138 2.502.99-2.577 2.76-.049-1.962-1.925.495-2.636-2.32 1.219-2.337-1.412Zm-3.06 7.478L18.2 26.349l-2.6.332 1.918 1.876-.503 2.702 2.289-1.543 2.289 1.543-.503-2.702 1.918-1.876-2.6-.332-1.104-2.497Zm32.592 0-1.104 2.497-2.6.332 1.918 1.876-.503 2.702 2.29-1.543 2.288 1.543-.502-2.702L55.6 26.68l-2.6-.33-1.104-2.497Zm-3.801-7.479-2.337 1.413-2.32-1.22.495 2.637-1.962 1.925 2.76.05.99 2.576 1.138-2.502 2.647-.436-1.94-1.764.529-2.678Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Macao;
