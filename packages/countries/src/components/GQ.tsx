// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GQProps = CountrySymbolProps;

const GQ = forwardRef<SVGSVGElement, GQProps>(function GQ(props: GQProps, ref) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="GQ"
      aria-label="Equatorial Guinea"
      viewBox="0 0 72 72"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: false })}
      {...rest}
    >
      <mask
        id={`${uid}-GQ-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-GQ-a)`}>
        <path fill="#DD2033" d="M0 72V50h72v22z" />
        <path fill="#F5F7F8" d="M0 50V22h72v28z" />
        <path fill="#008259" d="M0 22V0h72v22z" />
        <path fill="#0091DA" d="M28 36 0 0v72l28-36Z" />
        <path
          fill="#C1C3C3"
          d="M36 25h20v7.941a14.857 14.857 0 0 1-9.34 13.795L46 47l-.66-.264A14.857 14.857 0 0 1 36 32.94V25Z"
        />
        <path fill="#936846" d="M44 36h4v6h-4z" />
        <path
          fill="#009B77"
          d="M50 32a4 4 0 1 0-8 0 2 2 0 0 0 0 4h8a2 2 0 0 0 0-4Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default GQ;
