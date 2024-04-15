// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type EGProps = CountrySymbolProps;

const EG = forwardRef<SVGSVGElement, EGProps>(function EG(props: EGProps, ref) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="EG"
      aria-label="Egypt"
      viewBox="0 0 72 72"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: false })}
      {...rest}
    >
      <mask
        id={`${uid}-EG-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-EG-a)`}>
        <path fill="#31373D" d="M0 72V48h72v24z" />
        <path fill="#F5F7F8" d="M0 48V24h72v24z" />
        <path fill="#DD2033" d="M0 24V0h72v24z" />
        <path
          fill="#F1B434"
          d="M31 16h4a6 6 0 0 1 6 6v5.083c2.838.476 5 2.944 5 5.917v19l-8.514-3.406a4 4 0 0 0-2.972 0L26 52V33a6.002 6.002 0 0 1 5-5.917V16Z"
        />
        <path
          fill="#F1B434"
          d="M33.801 51.512 28 55.5h16.5l-6.26-4.05a4 4 0 0 0-4.439.062Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default EG;
