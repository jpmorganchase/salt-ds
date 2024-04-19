// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type PM_SharpProps = CountrySymbolProps;

const PM_Sharp = forwardRef<SVGSVGElement, PM_SharpProps>(function PM_Sharp(
  props: PM_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="PM_Sharp"
      aria-label="Saint Pierre and Miquelon"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": true })}
      {...rest}
    >
      <mask
        id={`${uid}-PM-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-PM-a)`}>
        <path fill="#004692" d="M0 50h24V0H0z" />
        <path fill="#F5F7F8" d="M24 50h24V0H24z" />
        <path fill="#DD2033" d="M48 50h24V0H48z" />
      </g>
    </CountrySymbol>
  );
});

export default PM_Sharp;
