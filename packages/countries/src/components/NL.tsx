// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type NLProps = CountrySymbolProps;

const NL = forwardRef<SVGSVGElement, NLProps>(function NL(props: NLProps, ref) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="NL"
      aria-label="Netherlands (the)"
      viewBox="0 0 72 72"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: false })}
      {...rest}
    >
      <mask
        id={`${uid}-NL-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-NL-a)`}>
        <path fill="#004692" d="M0 72V48h72v24z" />
        <path fill="#F5F7F8" d="M0 48V24h72v24z" />
        <path fill="#A00009" d="M0 24V0h72v24z" />
      </g>
    </CountrySymbol>
  );
});

export default NL;
