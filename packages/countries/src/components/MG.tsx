// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type MGProps = CountrySymbolProps;

const MG = forwardRef<SVGSVGElement, MGProps>(function MG(props: MGProps, ref) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="MG"
      aria-label="Madagascar"
      viewBox="0 0 72 72"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": false })}
      {...rest}
    >
      <mask
        id={`${uid}-MG-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-MG-a)`}>
        <path fill="#005B33" d="M0 72V36h72v36z" />
        <path fill="#DD2033" d="M0 36V0h72v36z" />
        <path fill="#F5F7F8" d="M0 0h24v72H0z" />
      </g>
    </CountrySymbol>
  );
});

export default MG;
