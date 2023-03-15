import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MoroccoProps = CountrySymbolProps;

const Morocco = forwardRef<SVGSVGElement, MoroccoProps>(function Morocco(
  props: MoroccoProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Morocco"
      aria-label="morocco"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 72V0h72v72z" />
        <path
          fill="#005B33"
          d="M62 28.862H42.138L36 9l-6.138 19.862H10l16.069 12.275L19.93 61 36 48.724 52.069 61l-6.138-19.862L62 28.862ZM30.566 39.6l2.076-6.717h6.716l2.076 6.717L36 43.751l-5.434-4.15Zm7.55-10.74h-4.231L36 22.018l2.115 6.845Zm6.572 8.254-1.307-4.23h6.844l-5.537 4.23Zm-16.069-4.23-1.307 4.23-5.538-4.23h6.845Zm-1.411 17.584 2.115-6.845 3.423 2.614-5.538 4.23Zm12.046-4.23 3.423-2.615 2.115 6.845-5.538-4.23Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Morocco;
