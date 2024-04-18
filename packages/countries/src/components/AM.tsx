// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type AMProps = CountrySymbolProps;

const AM = forwardRef<SVGSVGElement, AMProps>(function AM(props: AMProps, ref) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="AM"
      aria-label="Armenia"
      viewBox="0 0 72 72"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": false })}
      {...rest}
    >
      <mask
        id={`${uid}-AM-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-AM-a)`}>
        <path fill="#FF9E42" d="M0 72V48h72v24z" />
        <path fill="#005EB8" d="M0 48V24h72v24z" />
        <path fill="#DD2033" d="M0 24V0h72v24z" />
      </g>
    </CountrySymbol>
  );
});

export default AM;
