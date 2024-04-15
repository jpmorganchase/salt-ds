// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SI_SharpProps = CountrySymbolProps;

const SI_Sharp = forwardRef<SVGSVGElement, SI_SharpProps>(function SI_Sharp(
  props: SI_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="SI_Sharp"
      aria-label="Slovenia"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { saltSharpCountrySymbol: true })}
      {...rest}
    >
      <mask
        id={`${uid}-SI-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-SI-a)`}>
        <path fill="#DD2033" d="M0 50V34h72v16z" />
        <path fill="#005EB8" d="M0 34V16h72v18z" />
        <path fill="#F5F7F8" d="M0 16V0h72v16z" />
        <path
          fill="#005EB8"
          d="M15 4h20v7.941a14.857 14.857 0 0 1-9.34 13.795L25 26l-.66-.264A14.857 14.857 0 0 1 15 11.94V4Z"
        />
        <mask
          id={`${uid}-SI-b`}
          x="15"
          y="4"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path
            fill="#2F80ED"
            d="M15 4h20v7.941a14.857 14.857 0 0 1-9.34 13.795L25 26l-.66-.264A14.857 14.857 0 0 1 15 11.94V4Z"
          />
        </mask>
        <g mask={`url(#${uid}-SI-b)`}>
          <path
            fill="#F5F7F8"
            d="M29.059 14.68 25.2 9l-3.858 5.68L20.2 13l-8.66 12.75H23V26h5v-.25h10.86L30.2 13l-1.141 1.68Z"
          />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default SI_Sharp;
