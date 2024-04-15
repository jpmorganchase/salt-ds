// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GM_SharpProps = CountrySymbolProps;

const GM_Sharp = forwardRef<SVGSVGElement, GM_SharpProps>(function GM_Sharp(
  props: GM_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="GM_Sharp"
      aria-label="Gambia (the)"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: true })}
      {...rest}
    >
      <mask
        id={`${uid}-GM-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-GM-a)`}>
        <path fill="#F5F7F8" d="M0 0h72v50H0z" />
        <path fill="#005EB8" d="M0 34V16h72v18z" />
        <path fill="#DD2033" d="M0 11V0h72v11z" />
        <path fill="#009B77" d="M0 50V39h72v11z" />
      </g>
    </CountrySymbol>
  );
});

export default GM_Sharp;
