// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type DJ_SharpProps = CountrySymbolProps;

const DJ_Sharp = forwardRef<SVGSVGElement, DJ_SharpProps>(function DJ_Sharp(
  props: DJ_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="DJ_Sharp"
      aria-label="Djibouti"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: true })}
      {...rest}
    >
      <mask
        id={`${uid}-DJ-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-DJ-a)`}>
        <path fill="#009B77" d="M0 50V25h72v25z" />
        <path fill="#86C5FA" d="M0 25V0h72v25z" />
        <path fill="#F5F7F8" d="M42 25-6-11v72l48-36Z" />
        <path
          fill="#DD2033"
          d="m16 15-2.98 6.742L6 22.64l5.177 5.064L9.82 35 16 30.833 22.18 35l-1.357-7.297L26 22.64l-7.02-.897L16 15Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default DJ_Sharp;
