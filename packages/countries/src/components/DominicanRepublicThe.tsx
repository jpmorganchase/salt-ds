import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type DominicanRepublicTheProps = CountrySymbolProps;

export const DominicanRepublicThe = forwardRef<
  SVGSVGElement,
  DominicanRepublicTheProps
>(function DominicanRepublicThe(props: DominicanRepublicTheProps, ref) {
  return (
    <CountrySymbol
      data-testid="DominicanRepublicThe"
      aria-label="dominican republic (the)"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 36h36v36H0V36ZM36 0h36v36H36V0Z" />
        <path fill="#004692" d="M36 0v36H0V0h36Zm36 36v36H36V36h36Z" />
        <path fill="#F5F7F8" d="M29 72h14V43h29V29H43V0H29v29H0v14h29v29Z" />
      </g>
    </CountrySymbol>
  );
});
