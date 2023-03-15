import { forwardRef } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GreatBritainProps = CountrySymbolProps;

const GreatBritain = forwardRef<SVGSVGElement, GreatBritainProps>(
  function GreatBritain(props: GreatBritainProps, ref) {
    return (
      <CountrySymbol
        data-testid="GreatBritain"
        aria-label="great britain"
        viewBox="0 0 72 72"
        ref={ref}
        {...props}
      >
        <mask id="a" x="0" y="0" maskUnits="userSpaceOnUse" mask-type="alpha">
          <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
        </mask>
        <g mask="url(#a)">
          <path fill="#004692" d="M0 0h72v72H0z" />
          <path
            fill="#F5F7F8"
            d="m42.788 33.004-2.121 2.122 25.456 25.456 2.121-2.122-25.456-25.456Zm-5.656 5.657-3.536 3.536 25.456 25.456 3.535-3.536-25.456-25.456Z"
          />
          <path
            fill="#DD2033"
            d="m37.132 38.661 3.535-3.535 25.456 25.456-3.536 3.535-25.456-25.456Z"
          />
          <path
            fill="#F5F7F8"
            d="m38.244 42.193-2.12-2.122-25.457 25.456 2.122 2.121 25.455-25.455Zm-5.657-5.657L29.052 33 3.596 58.456l3.536 3.535 25.456-25.455Z"
          />
          <path
            fill="#DD2033"
            d="m32.587 36.536 3.536 3.535-25.456 25.456-3.535-3.536 25.456-25.455Z"
          />
          <path
            fill="#F5F7F8"
            d="m30.056 40.648 2.121-2.12L6.721 13.07l-2.12 2.122 25.455 25.456Zm5.657-5.656 3.535-3.536L13.793 6l-3.536 3.536 25.456 25.456Z"
          />
          <path
            fill="#DD2033"
            d="m35.713 34.992-3.536 3.535L6.721 13.071l3.536-3.535 25.456 25.456Z"
          />
          <path
            fill="#F5F7F8"
            d="m32.6 31.46 2.122 2.121L60.178 8.125l-2.122-2.12L32.6 31.46Zm5.657 5.657 3.536 3.535 25.456-25.456-3.536-3.535-25.456 25.456Z"
          />
          <path
            fill="#DD2033"
            d="m38.257 37.117-3.535-3.536L60.178 8.125l3.535 3.536-25.456 25.456Z"
          />
          <path
            fill="#F5F7F8"
            fillRule="evenodd"
            d="M30 72h-5V47H0v-5h25V30H0v-5h25V0h5v25h12V0h5v25h25v5H47v12h25v5H47v25h-5V47H30v25Zm12-42H30v12h12V30Z"
            clipRule="evenodd"
          />
          <path fill="#DD2033" d="M30 72h12V42h30V30H42V0H30v30H0v12h30v30Z" />
        </g>
      </CountrySymbol>
    );
  }
);

export default GreatBritain;
