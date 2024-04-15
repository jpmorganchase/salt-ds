// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type ST_SharpProps = CountrySymbolProps;

const ST_Sharp = forwardRef<SVGSVGElement, ST_SharpProps>(function ST_Sharp(
  props: ST_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="ST_Sharp"
      aria-label="Sao Tome and Principe"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: true })}
      {...rest}
    >
      <mask
        id={`${uid}-ST-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-ST-a)`}>
        <path fill="#009B77" d="M0-11h72v72H0z" />
        <path fill="#FBD381" d="M0 37V13h72v24z" />
        <path
          fill="#31373D"
          d="M42.611 23.045 44.4 19l1.788 4.045 4.212.539-3.106 3.038.814 4.378-3.708-2.5-3.708 2.5.814-4.378-3.106-3.038 4.212-.539Zm15.601 0L60 19l1.788 4.045 4.212.539-3.106 3.038.814 4.378L60 28.5 56.292 31l.814-4.378L54 23.584l4.212-.539Z"
        />
        <path fill="#DD2033" d="M36 25 0-11v72l36-36Z" />
      </g>
    </CountrySymbol>
  );
});

export default ST_Sharp;
