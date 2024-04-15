// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GE_SharpProps = CountrySymbolProps;

const GE_Sharp = forwardRef<SVGSVGElement, GE_SharpProps>(function GE_Sharp(
  props: GE_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="GE_Sharp"
      aria-label="Georgia"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: true })}
      {...rest}
    >
      <mask
        id={`${uid}-GE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-GE-a)`}>
        <path fill="#F5F7F8" d="M0 0h72v50H0z" />
        <path
          fill="#DD2033"
          d="M9 12.75v-3.5h5.25V4h3.5v5.25H23v3.5h-5.25V18h-3.5v-5.25H9Zm40 0v-3.5h5.25V4h3.5v5.25H63v3.5h-5.25V18h-3.5v-5.25H49Zm-40 28v-3.5h5.25V32h3.5v5.25H23v3.5h-5.25V46h-3.5v-5.25H9Zm40 0v-3.5h5.25V32h3.5v5.25H63v3.5h-5.25V46h-3.5v-5.25H49Z"
        />
      </g>
      <path fill="#DD2033" d="M32 0h8v50h-8z" />
      <path fill="#DD2033" d="M0 29v-8h72v8z" />
    </CountrySymbol>
  );
});

export default GE_Sharp;
