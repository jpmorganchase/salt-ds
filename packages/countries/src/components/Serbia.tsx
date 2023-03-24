import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SerbiaProps = CountrySymbolProps;

const Serbia = forwardRef<SVGSVGElement, SerbiaProps>(function Serbia(
  props: SerbiaProps,
  ref
) {
  return (
    <CountrySymbol
      data-testid="Serbia"
      aria-label="serbia"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#a)">
        <path fill="#F5F7F8" d="M0 72V48h72v24z" />
        <path fill="#004692" d="M0 48V24h72v24z" />
        <path
          fill="#DD2033"
          d="M0 24V0h72v24zm11.2 0h25v13.32c0 5.798-3.51 11.019-8.88 13.206a9.596 9.596 0 0 1-7.24 0A14.258 14.258 0 0 1 11.2 37.32V24Z"
        />
        <path
          fill="#F5F7F8"
          d="M30.774 28.41c-.972-.067-2.399.078-3.508.637-1 .503-1.697 1.29-1.697 2.763v.506l8.848-2.397a2.34 2.34 0 0 1-1.648 2.854l-7.2 1.951v.602l9.036-2.449a2.34 2.34 0 0 1-1.648 2.854l-7.137 1.934.473.474 7.945-2.153a2.34 2.34 0 0 1-1.648 2.855l-4.406 1.194 3.904 3.914-2.395 2.4-4.222-4.232 1.79 4.488L23.876 50l-3.387-3.396 1.786-4.475-4.23 4.24-2.395-2.4 3.848-3.858-4.687-1.27a2.34 2.34 0 0 1-1.648-2.855l8.226 2.23.473-.475-7.418-2.01a2.34 2.34 0 0 1-1.648-2.854l9.374 2.54v-.602l-7.537-2.042a2.34 2.34 0 0 1-1.648-2.854l9.185 2.489v-.579c0-1.473-.697-2.26-1.697-2.763-1.11-.559-2.537-.703-3.509-.636l-.233-3.387c1.367-.095 3.448.076 5.261.988a6.85 6.85 0 0 1 1.868 1.36 6.858 6.858 0 0 1 1.887-1.379c1.814-.913 3.895-1.083 5.261-.989l-.233 3.387Z"
        />
        <path
          fill="#DD2033"
          d="M19.2 32h9v5.628a5.19 5.19 0 0 1-3.081 4.742 3.493 3.493 0 0 1-2.837 0 5.189 5.189 0 0 1-3.082-4.742V32Z"
        />
        <path
          fill="#F1B434"
          fillRule="evenodd"
          d="M25.2 8.572h-2V10h-2v2h2v1.723a5.143 5.143 0 0 0-6.286 8.11V24h14.572v-2.167a5.143 5.143 0 0 0-6.286-8.11V12h2v-2h-2V8.572Zm-1 12.83-.024.027h.048l-.024-.027Zm-3.847-.83h-.01A2.571 2.571 0 1 1 22.915 18v2.572h-2.562ZM30.629 18a2.572 2.572 0 0 1-2.572 2.572h-2.571V18a2.571 2.571 0 0 1 5.143 0Z"
          clipRule="evenodd"
        />
        <path fill="#F5F7F8" d="M25 32h-2v4h-3.8v2H23v5h2v-5h3.2v-2H25v-4Z" />
      </g>
    </CountrySymbol>
  );
});

export default Serbia;
