// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type TN_SharpProps = CountrySymbolProps;

const TN_Sharp = forwardRef<SVGSVGElement, TN_SharpProps>(function TN_Sharp(
  props: TN_SharpProps,
  ref
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="TN_Sharp"
      aria-label="Tunisia"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-TN-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-TN-a)`}>
        <path fill="#DD2033" d="M0 0h72v50H0z" />
        <path
          fill="#F5F7F8"
          fillRule="evenodd"
          d="M36 46c11.598 0 21-9.402 21-21S47.598 4 36 4s-21 9.402-21 21 9.402 21 21 21Zm3.818-33.019c3.612 0 6.858 1.603 9.095 4.151C46.206 12.76 41.434 9.857 36 9.857c-8.435 0-15.273 6.994-15.273 15.62 0 8.627 6.838 15.62 15.273 15.62 5.434 0 10.206-2.903 12.913-7.275-2.237 2.548-5.483 4.151-9.095 4.151-6.748 0-12.218-5.594-12.218-12.496 0-6.901 5.47-12.496 12.218-12.496Zm2.88 8.36 5.776-2.285-2.234 5.906 3.636 4.81-6.083-.07-3.527 5.258-1.197-6.286-6.145-1.223 5.14-3.608-.067-6.221 4.702 3.719Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default TN_Sharp;
