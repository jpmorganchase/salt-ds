import { useId } from "@salt-ds/core";
import { clsx } from "clsx";
// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type FO_SharpProps = CountrySymbolProps;

const FO_Sharp = forwardRef<SVGSVGElement, FO_SharpProps>(function FO_Sharp(
  props: FO_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="FO_Sharp"
      aria-label="Faroe Islands (the)"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-FO-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-FO-a)`}>
        <path fill="#F5F7F8" d="M0 0h72v50H0z" />
        <path
          fill="#004692"
          fillRule="evenodd"
          d="M20 50h-6V36.7H0v-6h14V19.3H0v-6h14V0h6v13.3h11.4V0h6v13.3H72v6H37.4v11.4H72v6H37.4V50h-6V36.7H20V50Zm11.4-30.7H20v11.4h11.4V19.3Z"
          clipRule="evenodd"
        />
        <path fill="#DD2033" d="M20 50h12V31h40V19H32V0H20v19H0v12h20v19Z" />
      </g>
    </CountrySymbol>
  );
});

export default FO_Sharp;
