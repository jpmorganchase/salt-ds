import { useId } from "@salt-ds/core";
import { clsx } from "clsx";
// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type SY_SharpProps = CountrySymbolProps;

const SY_Sharp = forwardRef<SVGSVGElement, SY_SharpProps>(function SY_Sharp(
  props: SY_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="SY_Sharp"
      aria-label="Syrian Arab Republic (the)"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-SY-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-SY-a)`}>
        <path fill="#31373D" d="M0 50V35h72v15z" />
        <path fill="#F5F7F8" d="M0 35V15h72v20z" />
        <path
          fill="#009B77"
          d="M16.212 23.045 18 19l1.788 4.045 4.212.539-3.106 3.038.814 4.378L18 28.5 14.292 31l.814-4.378L12 23.584l4.212-.539Zm36 0L54 19l1.788 4.045 4.212.539-3.106 3.038.814 4.378L54 28.5 50.292 31l.814-4.378L48 23.584l4.212-.539Z"
        />
        <path fill="#DD2033" d="M0 15V0h72v15z" />
      </g>
    </CountrySymbol>
  );
});

export default SY_Sharp;
