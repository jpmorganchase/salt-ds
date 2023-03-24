import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type KazakhstanProps = CountrySymbolProps;

export const Kazakhstan = forwardRef<SVGSVGElement, KazakhstanProps>(
  function Kazakhstan(props: KazakhstanProps, ref) {
    return (
      <CountrySymbol
        data-testid="Kazakhstan"
        aria-label="kazakhstan"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#3CCBDA" d="M0 0h72v72H0z" />
          <path
            fill="#FBD381"
            d="m16.2 16.971-10 10V0h10v16.971Zm-10 15.657v6.744l10 10V22.628l-10 10Zm0 12.401 10 10V72h-10V45.029ZM56.2 28l-4.903 2.425 2.61 4.991-5.323-1.07L47.909 40 44.2 35.842 40.492 40l-.675-5.654-5.325 1.07 2.611-4.992L32.2 28l4.904-2.425-2.612-4.991 5.325 1.07.675-5.654 3.708 4.159L47.91 16l.675 5.654 5.324-1.07-2.611 4.992L56.2 28Zm4.436 5a18.777 18.777 0 0 1-2.675 5.48c-2.425 3.423-5.764 5.735-9.384 6.826a16.962 16.962 0 0 1-3.877.692L33.894 57l11.546-2.047a16.715 16.715 0 0 0 7.13-2.22 17.118 17.118 0 0 0 5.356-4.92c3.143-4.435 3.97-9.885 2.71-14.813ZM40.089 45.62a16.272 16.272 0 0 1-6.195-2.886c-3.155-2.376-5.259-5.696-6.229-9.344-1.542 6.647.789 13.896 6.457 18.197l5.967-5.966Z"
          />
        </g>
      </CountrySymbol>
    );
  }
);
