import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MongoliaProps = CountrySymbolProps;

const Mongolia = forwardRef<SVGSVGElement, MongoliaProps>(function Mongolia(
  props: MongoliaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Mongolia"
      aria-label="mongolia"
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
          transform="matrix(0 -1 -1 0 72 72)"
        />
      </mask>
      <g mask="url(#a)">
        <path fill="#DD2033" d="M0 72h72V0H0z" />
        <path fill="#005EB8" d="M27 72h18V0H27z" />
        <path
          fill="#F1B434"
          d="M14 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm4 5a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM8 30H4v20h4V30Zm6 3 4-3h-8l4 3Zm6-3h4v20h-4V30Z"
        />
        <path
          fill="#F1B434"
          fillRule="evenodd"
          d="M14 35a5 5 0 0 0-2.665 9.23 3.077 3.077 0 0 1 2.655-4.615H14c.038 0 .076 0 .114-.003A2.308 2.308 0 0 0 14 35Zm-1.179 2.308a1.154 1.154 0 1 1 2.308 0 1.154 1.154 0 0 1-2.308 0Z"
          clipRule="evenodd"
        />
        <path
          fill="#F1B434"
          fillRule="evenodd"
          d="m17.077 37.298-.001-.077a3.076 3.076 0 0 0-.411-1.452A4.995 4.995 0 0 1 19 40a5 5 0 0 1-5 5 2.3 2.3 0 0 1-1.632-.676 2.308 2.308 0 0 1-.676-1.632v-.007l.001-.05A2.308 2.308 0 0 1 14 40.385a3.077 3.077 0 0 0 3.077-3.077v-.01Zm-1.898 5.394a1.154 1.154 0 1 1-2.308 0 1.154 1.154 0 0 1 2.308 0Z"
          clipRule="evenodd"
        />
        <path fill="#F1B434" d="m18 47-4 3-4-3h8Z" />
      </g>
    </CountrySymbol>
  );
});

export default Mongolia;
