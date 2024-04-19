// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type RU_SharpProps = CountrySymbolProps;

const RU_Sharp = forwardRef<SVGSVGElement, RU_SharpProps>(function RU_Sharp(
  props: RU_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="RU_Sharp"
      aria-label="Russian Federation (the)"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": true })}
      {...rest}
    >
      <mask
        id={`${uid}-RU-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-RU-a)`}>
        <path fill="#DD2033" d="M0 50V34h72v16z" />
        <path fill="#004692" d="M0 34V16h72v18z" />
        <path fill="#F5F7F8" d="M0 16V0h72v16z" />
      </g>
    </CountrySymbol>
  );
});

export default RU_Sharp;
