import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type NorthernMarianaIslandsTheProps = CountrySymbolProps;

const NorthernMarianaIslandsThe = forwardRef<
  SVGSVGElement,
  NorthernMarianaIslandsTheProps
>(function NorthernMarianaIslandsThe(
  props: NorthernMarianaIslandsTheProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="NorthernMarianaIslandsThe"
      aria-label="northern mariana islands (the)"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#0091DA" d="M0 0h72v72H0z" />
        <path
          fill="#F5F7F8"
          fillRule="evenodd"
          d="M32.098 61.17a2.796 2.796 0 0 0 2.63 1.83c1.097 0 2.06-.638 2.515-1.575a2.805 2.805 0 0 0 2.805 1.295 2.8 2.8 0 0 0 2.292-2.075 2.804 2.804 0 0 0 3.01.705l-.405.15.407-.15a2.8 2.8 0 0 0 1.823-2.496 2.798 2.798 0 0 0 4.373-2.727c.998.43 2.201.255 3.041-.541a2.797 2.797 0 0 0 .693-3.01 2.8 2.8 0 0 0 2.946-4.226 2.797 2.797 0 0 0 2.034-4.733 2.797 2.797 0 0 0 1.036-5.045A2.8 2.8 0 0 0 63 35.998v-.062a2.795 2.795 0 0 0-1.708-2.569 2.796 2.796 0 0 0-1.047-5.043 2.8 2.8 0 0 0 .546-3.042 2.803 2.803 0 0 0-2.589-1.687 2.8 2.8 0 0 0-2.958-4.219c.38-1.02.142-2.21-.698-3.007a2.804 2.804 0 0 0-3.044-.533 2.802 2.802 0 0 0-4.378-2.718 2.8 2.8 0 0 0-4.838-1.782 2.8 2.8 0 0 0-2.298-2.067 2.8 2.8 0 0 0-2.8 1.3 2.8 2.8 0 0 0-2.66-1.565 2.8 2.8 0 0 0-2.488 1.83 2.802 2.802 0 0 0-4.988 1.3 2.804 2.804 0 0 0-3.068-.392 2.797 2.797 0 0 0-1.558 2.668 2.797 2.797 0 0 0-4.068 3.16 2.8 2.8 0 0 0-3.354 3.911 2.797 2.797 0 0 0-2.5 4.504 2.796 2.796 0 0 0-1.536 4.918A2.799 2.799 0 0 0 9.016 33.3h-.002a2.796 2.796 0 0 0 1.44 2.727 2.795 2.795 0 0 0 .525 5.121 2.798 2.798 0 0 0 1.547 4.914c-.67.86-.8 2.07-.235 3.08a2.801 2.801 0 0 0 2.743 1.42 2.792 2.792 0 0 0 .39 3.062 2.796 2.796 0 0 0 2.973.84 2.798 2.798 0 0 0 4.078 3.151 2.798 2.798 0 0 0 1.563 2.667 2.805 2.805 0 0 0 3.066-.398 2.804 2.804 0 0 0 4.994 1.286ZM36 54c9.941 0 18-8.059 18-18s-8.059-18-18-18-18 8.059-18 18 8.059 18 18 18Z"
          clipRule="evenodd"
        />
        <path
          fill="#C1C3C3"
          d="M30.5 21a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h.75l-3.469 27.752A2 2 0 0 0 29.766 61h12.468a2 2 0 0 0 1.985-2.248L40.75 31h.75a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-11Z"
        />
        <path
          fill="#F5F7F8"
          d="m36 24-3.577 8.09L24 33.168l6.213 6.077L28.583 48 36 43l7.416 5-1.629-8.756L48 33.167l-8.423-1.076L36 24Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default NorthernMarianaIslandsThe;
