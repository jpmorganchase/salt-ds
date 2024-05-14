// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type OMProps = CountrySymbolProps;

const OM = forwardRef<SVGSVGElement, OMProps>(function OM(props: OMProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="OM"
      aria-label="Oman"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-OM-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-OM-a)`}>
        <path fill="#DD2033" d="M0 0h72v72H0z" />
        <path fill="#005B33" d="M37 72V48h35v24z" />
        <path
          fill="#F5F7F8"
          d="M37 24V0h35v24zm-21.55-9.192-4.242 4.242 4.95 4.95-4.95 4.95 4.242 4.242 4.95-4.95 4.95 4.95 4.242-4.242-4.95-4.95 4.95-4.95-4.242-4.242-4.95 4.95-4.95-4.95Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default OM;
