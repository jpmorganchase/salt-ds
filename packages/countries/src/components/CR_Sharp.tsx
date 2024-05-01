// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CR_SharpProps = CountrySymbolProps;

const CR_Sharp = forwardRef<SVGSVGElement, CR_SharpProps>(function CR_Sharp(
  props: CR_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="CR_Sharp"
      aria-label="Costa Rica"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": true })}
      {...rest}
    >
      <mask
        id={`${uid}-CR-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-CR-a)`}>
        <path fill="#004692" d="M0 0h72v50H0z" />
        <path fill="#F5F7F8" d="M0 40V11h72v29z" />
        <path fill="#DD2033" d="M0 30V20h72v10z" />
      </g>
    </CountrySymbol>
  );
});

export default CR_Sharp;
