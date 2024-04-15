// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CO_SharpProps = CountrySymbolProps;

const CO_Sharp = forwardRef<SVGSVGElement, CO_SharpProps>(function CO_Sharp(
  props: CO_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="CO_Sharp"
      aria-label="Colombia"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: true })}
      {...rest}
    >
      <mask
        id={`${uid}-CO-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-CO-a)`}>
        <path fill="#DD2033" d="M0 61V43h72v18z" />
        <path fill="#F1B434" d="M0 25V0h72v25z" />
        <path fill="#004692" d="M0 43V25h72v18z" />
      </g>
    </CountrySymbol>
  );
});

export default CO_Sharp;
