// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef, useState } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type RWProps = CountrySymbolProps;

const RW = forwardRef<SVGSVGElement, RWProps>(function RW(props: RWProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="RW"
      aria-label="Rwanda"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-RW-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-RW-a)`}>
        <path fill="#005B33" d="M0 72V54h72v18z" />
        <path fill="#0091DA" d="M0 36V0h72v36z" />
        <path fill="#FBD381" d="M0 54V36h72v18z" />
      </g>
    </CountrySymbol>
  );
});

export default RW;
