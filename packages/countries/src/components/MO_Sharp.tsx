import { useId } from "@salt-ds/core";
import { clsx } from "clsx";
// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type MO_SharpProps = CountrySymbolProps;

const MO_Sharp = forwardRef<SVGSVGElement, MO_SharpProps>(function MO_Sharp(
  props: MO_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="MO_Sharp"
      aria-label="Macao"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-MO-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-MO-a)`}>
        <path fill="#008259" d="M72 50H0V0h72z" />
        <mask
          id={`${uid}-MO-b`}
          x="17"
          y="6"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <circle cx="36" cy="25" r="19" fill="#D9D9D9" />
        </mask>
        <g mask={`url(#${uid}-MO-b)`}>
          <path
            fill="#F5F7F8"
            fillRule="evenodd"
            d="M58.483 41.625H13.358V44h45.125v-2.375Zm1.267-4.75H14.625v2.375H59.75v-2.375Z"
            clipRule="evenodd"
          />
          <path
            fill="#F5F7F8"
            d="M39.888 25.862c1.445-2.577 1.614-6.236-3.842-10.362-5.498 4.177-5.394 7.797-3.969 10.343-2.575-1.427-6.22-1.571-10.327 3.86 8.023 10.56 13.99.454 14.242.015l.025.015c.354.61 6.285 10.433 14.233-.03-4.126-5.455-7.785-5.286-10.362-3.841Z"
          />
          <path
            fill="#F1B434"
            d="m35.687 6-.874 1.977-2.058.263 1.518 1.485-.398 2.14 1.812-1.223 1.813 1.222-.398-2.14L38.62 8.24l-2.059-.263L35.687 6ZM25.522 9.462l.418 2.121-1.535 1.396 2.095.346.901 1.98.784-2.04 2.185-.038-1.553-1.524.392-2.088-1.837.966-1.85-1.119Zm-2.423 5.921-.874 1.977-2.058.263 1.518 1.485-.398 2.139 1.812-1.222 1.812 1.222-.398-2.14 1.518-1.484-2.058-.263-.874-1.977Zm25.802 0-.874 1.977-2.058.263 1.518 1.485-.398 2.139 1.812-1.222 1.813 1.222-.399-2.14 1.518-1.484-2.058-.263-.874-1.977Zm-3.009-5.921-1.85 1.118-1.837-.965.392 2.088-1.553 1.524 2.185.038.784 2.04.9-1.98 2.096-.346-1.535-1.396.418-2.12Z"
          />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default MO_Sharp;
