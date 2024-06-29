import { useId } from "@salt-ds/core";
import { clsx } from "clsx";
// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type VE_SharpProps = CountrySymbolProps;

const VE_Sharp = forwardRef<SVGSVGElement, VE_SharpProps>(function VE_Sharp(
  props: VE_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="VE_Sharp"
      aria-label="Venezuela (Bolivarian Republic of)"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-VE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-VE-a)`}>
        <path fill="#DD2033" d="M0 50V40h72v10z" />
        <path fill="#004692" d="M0 40V10h72v30z" />
        <path fill="#F1B434" d="M0 10V0h72v10z" />
        <path
          fill="#F5F7F8"
          d="m34.867 12-1.49 3.371-3.51.449 2.588 2.532L31.777 22l3.09-2.083L37.957 22l-.679-3.648 2.589-2.532-3.51-.449L34.867 12Zm-17.335 5.904.713 3.616-2.618 2.381 3.573.59 1.536 3.377 1.337-3.479 3.726-.066-2.649-2.599.668-3.559-3.132 1.646-3.154-1.907ZM13.4 28l-1.49 3.371-3.51.449 2.588 2.532L10.31 38l3.09-2.083L16.49 38l-.679-3.648L18.4 31.82l-3.51-.449L13.4 28Zm44 0-1.49 3.371-3.51.449 2.589 2.532-.68 3.648 3.09-2.083L60.49 38l-.679-3.648L62.4 31.82l-3.51-.449L57.4 28Zm-5.132-10.096-3.155 1.907-3.132-1.646.668 3.56-2.648 2.598 3.726.066 1.336 3.48L50.6 24.49l3.573-.589-2.618-2.38.713-3.617Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default VE_Sharp;
