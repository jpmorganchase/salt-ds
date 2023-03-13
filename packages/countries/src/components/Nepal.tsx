import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type NepalProps = CountrySymbolProps;

export const Nepal = forwardRef<SVGSVGElement, NepalProps>(function Nepal(
  props: NepalProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Nepal"
      aria-label="nepal"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#F5F7F8" d="M0 0h72v72H0z" />
        <path
          fill="#004692"
          d="M71.12 40H37.047l35.027 36H24.5l-37.9-36L17.045-8.067 27.86 1.546 71.12 40Z"
        />
        <path
          fill="#DD2033"
          d="M60.6 36 18.5-1.5-9 36v36h71.6L27.573 36H60.6Z"
        />
        <path
          fill="#F5F7F8"
          d="m33.6 53-4.903 2.425 2.61 4.992-5.324-1.071L25.31 65l-3.71-4.158L17.891 65l-.674-5.654-5.325 1.07 2.611-4.992L9.6 53l4.904-2.425-2.612-4.991 5.325 1.07.675-5.654 3.708 4.158L25.309 41l.674 5.654 5.325-1.07-2.611 4.992L33.6 53Z"
        />
        <mask id="b" x="10" y="10" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="21.6" cy="21" r="11" fill="#D9D9D9" />
        </mask>
        <g mask="url(#b)">
          <path
            fill="#F5F7F8"
            d="m29.6 22.894-3.269 1.616 1.74 3.328-3.549-.714-.45 3.77-2.472-2.772-2.472 2.772-.45-3.77-3.55.714 1.741-3.328-3.269-1.616 3.27-1.617-1.742-3.327 3.55.713.45-3.77 2.472 2.773 2.473-2.772.45 3.77 3.549-.714-1.74 3.328 3.268 1.616Z"
          />
        </g>
        <path
          fill="#F5F7F8"
          d="M32.545 19.894c-1.88 4.17-6.074 7.073-10.945 7.073s-9.065-2.903-10.945-7.073A11.14 11.14 0 0 0 10.6 21c0 6.075 4.925 11 11 11s11-4.925 11-11c0-.373-.019-.742-.055-1.106Z"
        />
      </g>
    </CountrySymbol>
  );
});
