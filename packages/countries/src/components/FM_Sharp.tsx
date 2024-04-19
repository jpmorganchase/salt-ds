// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type FM_SharpProps = CountrySymbolProps;

const FM_Sharp = forwardRef<SVGSVGElement, FM_SharpProps>(function FM_Sharp(
  props: FM_SharpProps,
  ref
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="FM_Sharp"
      aria-label="Micronesia (Federated States of)"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-FM-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-FM-a)`}>
        <path fill="#86C5FA" d="M0 0h72v50H0z" />
        <path
          fill="#F5F7F8"
          d="M33.487 8.394 35.872 3l2.385 5.394 5.615.717-4.142 4.052L40.816 19l-4.944-3.333L30.928 19l1.086-5.837-4.142-4.052 5.615-.717ZM11.504 23.863 10.873 18l4.761 3.479 5.222-2.186-1.56 5.58 3.858 4.511-5.948-.414-2.615 5.358-1.978-5.598L7 27.293l4.504-3.43ZM60.2 18l-.632 5.863 4.505 3.43-5.613 1.437-1.978 5.598-2.615-5.358-5.949.414 3.86-4.512-1.562-5.58 5.222 2.187 4.762-3.48ZM38.257 41.606 35.872 47l-2.385-5.394-5.615-.718 4.142-4.05L30.928 31l4.944 3.333L40.816 31l-1.086 5.837 4.142 4.052-5.615.717Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default FM_Sharp;
