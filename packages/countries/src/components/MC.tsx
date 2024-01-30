// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MCProps = CountrySymbolProps;

const MC = forwardRef<SVGSVGElement, MCProps>(function MC(props: MCProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="MC"
      aria-label="Monaco"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-MC-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-MC-a)`}>
        <path fill="#DD2033" d="M0 0v36h72V0z" />
        <path fill="#F5F7F8" d="M0 36v36h72V36z" />
      </g>
    </CountrySymbol>
  );
});

export default MC;
