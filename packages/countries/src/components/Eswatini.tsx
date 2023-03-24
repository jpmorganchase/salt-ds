import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type EswatiniProps = CountrySymbolProps;

export const Eswatini = forwardRef<SVGSVGElement, EswatiniProps>(
  function Eswatini(props: EswatiniProps, ref) {
    return (
      <CountrySymbol
        data-testid="Eswatini"
        aria-label="eswatini"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#005EB8" d="M0 0h72v72H0z" />
          <path fill="#F1B434" d="M0 58V14h72v44z" />
          <path fill="#A00009" d="M0 52V20h72v32z" />
          <path
            fill="#F1B434"
            d="M10.6 32v-3h46v3h-46Zm8 6v-3h46v3h-46Zm-11 4v3h46v-3h-46Z"
          />
          <path
            fill="#31373D"
            d="m58 36.103-1.493 1.798c-5.39 6.495-10.747 10.06-15.952 11.434-5.256 1.388-9.96.44-13.772-1.355-3.76-1.768-6.705-4.375-8.673-6.46a33.938 33.938 0 0 1-2.296-2.7c-.265-.348-.47-.633-.613-.838l-.242-.356-.959-1.48.924-1.502.234-.362c.14-.21.34-.501.597-.856A33.456 33.456 0 0 1 18 30.67c1.926-2.128 4.825-4.793 8.564-6.604 3.797-1.839 8.5-2.806 13.792-1.39 5.227 1.401 10.64 5.026 16.148 11.63L58 36.104Z"
          />
          <path
            fill="#F5F7F8"
            fillRule="evenodd"
            d="M36.022 47.094 32.6 44l4.423-4-4.423-4 4.423-4-4.423-4 3.413-3.087c5.26.243 11.401 3.159 18.102 11.194-6.63 7.988-12.79 10.818-18.093 10.987ZM41.6 32h-2v8h2v-8Zm4 0h-2v8h2v-8Z"
            clipRule="evenodd"
          />
          <path fill="#F5F7F8" d="M23.6 32h2v8h-2v-8Zm4 0h2v8h-2v-8Z" />
        </g>
      </CountrySymbol>
    );
  }
);
