// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type TNProps = CountrySymbolProps;

const TN = forwardRef<SVGSVGElement, TNProps>(function TN(props: TNProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="TN"
      aria-label="Tunisia"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-TN-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-TN-a)`}>
        <path fill="#DD2033" d="M0 0h72v72H0z" />
        <path
          fill="#F5F7F8"
          fillRule="evenodd"
          d="M36 57.022c12.15 0 22-9.63 22-21.51C58 23.63 48.15 14 36 14s-22 9.63-22 21.511c0 11.88 9.85 21.511 22 21.511ZM40 23.2a12.77 12.77 0 0 1 9.528 4.252C46.692 22.973 41.693 20 36 20c-8.837 0-16 7.163-16 16s7.163 16 16 16c5.693 0 10.692-2.973 13.528-7.452A12.768 12.768 0 0 1 40 48.8c-7.07 0-12.8-5.73-12.8-12.8S32.93 23.2 40 23.2Zm3.018 8.563 6.05-2.34-2.34 6.05 3.809 4.926-6.373-.07-3.695 5.384-1.253-6.438-6.439-1.253 5.385-3.696-.07-6.373 4.926 3.81Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default TN;
