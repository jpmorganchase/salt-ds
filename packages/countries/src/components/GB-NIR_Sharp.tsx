// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GB_NIR_SharpProps = CountrySymbolProps;

const GB_NIR_Sharp = forwardRef<SVGSVGElement, GB_NIR_SharpProps>(
  function GB_NIR_Sharp(props: GB_NIR_SharpProps, ref) {
    const uid = useId(props.id);

    const { className, ...rest } = props;

    return (
      <CountrySymbol
        data-testid="GB_NIR_Sharp"
        aria-label="Northern Ireland"
        viewBox="0 0 72 50"
        ref={ref}
        className={clsx(className, { "saltCountrySymbol-sharp": true })}
        {...rest}
      >
        <mask
          id={`${uid}-GB-NIR-a`}
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#D9D9D9" d="M0 0h72v50H0z" />
        </mask>
        <g mask={`url(#${uid}-GB-NIR-a)`}>
          <path fill="#F5F7F8" d="M0 0h72v50H0z" />
          <path
            fill="#DD2033"
            d="M30.4 50h12V31H72V19H42.4V0h-12v19H0v12h30.4v19Z"
          />
          <path
            fill="#F5F7F8"
            fillRule="evenodd"
            d="M33.37 19.742 36.5 13l3.13 6.742 7.37.897-5.436 5.064L42.989 33 36.5 28.833 30.01 33l1.426-7.297L26 20.64l7.37-.897Zm4.88.758h-2.625v1.667h-1.75V28h4.375v-1.667H40v-2.5h-1.75V20.5Z"
            clipRule="evenodd"
          />
          <path
            fill="#F1B434"
            fillRule="evenodd"
            d="M35.429 1h2.142v1.5h2.143v2.25h-2.143v2.102a4.112 4.112 0 0 1 2.143-.602c2.367 0 4.286 2.015 4.286 4.5a4.59 4.59 0 0 1-1.429 3.354V16H30.43v-1.896A4.59 4.59 0 0 1 29 10.75c0-2.485 1.919-4.5 4.286-4.5.78 0 1.512.22 2.143.602V4.75h-2.143V2.5h2.143V1ZM36.5 7.773l-.02-.023h.04l-.02.023Zm-.02 5.977.02-.023.02.023h-.04Z"
            clipRule="evenodd"
          />
        </g>
      </CountrySymbol>
    );
  }
);

export default GB_NIR_Sharp;
