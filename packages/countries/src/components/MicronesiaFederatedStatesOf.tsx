import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MicronesiaFederatedStatesOfProps = CountrySymbolProps;

export const MicronesiaFederatedStatesOf = forwardRef<
  SVGSVGElement,
  MicronesiaFederatedStatesOfProps
>(function MicronesiaFederatedStatesOf(
  props: MicronesiaFederatedStatesOfProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="MicronesiaFederatedStatesOf"
      aria-label="micronesia (federated states of)"
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
        <path fill="#86C5FA" d="M0 0h72v72H0z" />
        <path
          fill="#F5F7F8"
          d="M33.615 12.394 36 7l2.385 5.394L44 13.11l-4.142 4.052L40.944 23 36 19.667 31.056 23l1.086-5.837L28 13.11l5.615-.717ZM11.632 34.863 11.001 29l4.761 3.479 5.222-2.186-1.56 5.58 3.858 4.511-5.948-.414-2.615 5.359-1.978-5.599-5.613-1.437 4.504-3.43ZM60.328 29l-.632 5.863 4.505 3.43-5.613 1.437-1.978 5.599-2.615-5.36-5.949.415 3.86-4.512-1.562-5.58 5.222 2.187L60.328 29ZM38.385 59.606 36 65l-2.385-5.394L28 58.89l4.142-4.052L31.056 49 36 52.333 40.944 49l-1.086 5.837L44 58.89l-5.615.717Z"
        />
      </g>
    </CountrySymbol>
  );
});
