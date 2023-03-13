import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type UzbekistanProps = CountrySymbolProps;

export const Uzbekistan = forwardRef<SVGSVGElement, UzbekistanProps>(
  function Uzbekistan(props: UzbekistanProps, ref) {
    return (
      <CountrySymbol
        data-testid="Uzbekistan"
        aria-label="uzbekistan"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#0091DA" d="M0 0v24h72V0z" />
          <path
            fill="#F5F7F8"
            d="M51.106 3.023 52 1l.894 2.023L55 3.292 53.447 4.81 53.854 7 52 5.75 50.146 7l.407-2.189L49 3.291l2.106-.268Zm8 0L60 1l.894 2.023L63 3.292 61.447 4.81 61.854 7 60 5.75 58.146 7l.407-2.189L57 3.291l2.106-.268ZM44 8l-.894 2.023-2.106.269 1.553 1.519L42.146 14 44 12.75 45.854 14l-.407-2.189L47 10.291l-2.106-.268L44 8Zm7.106 2.023L52 8l.894 2.023 2.106.269-1.553 1.519.407 2.189L52 12.75 50.146 14l.407-2.189L49 10.291l2.106-.268ZM60 8l-.894 2.023-2.106.269 1.553 1.519L58.146 14 60 12.75 61.854 14l-.407-2.189L63 10.291l-2.106-.268L60 8Zm-16.894 9.023L44 15l.894 2.023 2.106.269-1.553 1.519.407 2.189L44 19.75 42.146 21l.407-2.189L41 17.291l2.106-.268ZM36 15l-.894 2.023-2.106.269 1.553 1.519L34.146 21 36 19.75 37.854 21l-.407-2.189L39 17.291l-2.106-.268L36 15Zm23.106 2.023L60 15l.894 2.023 2.106.269-1.553 1.519.407 2.189L60 19.75 58.146 21l.407-2.189L57 17.291l2.106-.268ZM52 15l-.894 2.023-2.106.269 1.553 1.519L50.146 21 52 19.75 53.854 21l-.407-2.189L55 17.291l-2.106-.268L52 15Zm-28.178 4.068a6.728 6.728 0 0 0 5.407 1.384 8.126 8.126 0 1 1 .955-12.467c-2.634-1.07-5.718-.387-7.533 1.885-2.225 2.785-1.7 6.903 1.171 9.198Z"
          />
          <path fill="#009B77" d="M0 48v24h72V48z" />
          <path fill="#DD2033" d="M0 24v24h72V24z" />
          <path fill="#F5F7F8" d="M0 28v16h72V28z" />
        </g>
      </CountrySymbol>
    );
  }
);
