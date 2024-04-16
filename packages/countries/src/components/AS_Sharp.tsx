// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type AS_SharpProps = CountrySymbolProps;

const AS_Sharp = forwardRef<SVGSVGElement, AS_SharpProps>(function AS_Sharp(
  props: AS_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="AS_Sharp"
      aria-label="American Samoa"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": true })}
      {...rest}
    >
      <mask
        id={`${uid}-AS-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-AS-a)`}>
        <path fill="#004692" d="M0-11h72v72H0z" />
        <path fill="#DD2033" d="m-10 25 83 42v-84l-83 42Z" />
        <path fill="#F5F7F8" d="m6 25 83 42v-84L6 25Z" />
        <path
          fill="#936846"
          d="M64 24h-4c1.079-1.336.863-3.131-.352-4.385a3.475 3.475 0 0 0 0-4.807l-.078.08c1.288-1.328 1.365-3.56.078-4.888L41 29.23c1.287 1.328 3.338 1.313 4.625-.015l.36-.338 8.929-.837V32h3.029v-4.244l4.543-.426L64 24Z"
        />
        <path
          fill="#FF9E42"
          d="M59.648 19.615c1.215 1.254 1.43 3.05.352 4.385h-3l-6.676-4.385L59.648 10a3.475 3.475 0 0 1 0 4.807 3.475 3.475 0 0 1 0 4.808Z"
        />
        <path fill="#F1B434" d="M41.068 34 38 32.5l3.068-1.5H61v3H41.068Z" />
      </g>
    </CountrySymbol>
  );
});

export default AS_Sharp;
