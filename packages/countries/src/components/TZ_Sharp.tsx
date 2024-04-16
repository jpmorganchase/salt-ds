// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type TZ_SharpProps = CountrySymbolProps;

const TZ_Sharp = forwardRef<SVGSVGElement, TZ_SharpProps>(function TZ_Sharp(
  props: TZ_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="TZ_Sharp"
      aria-label="Tanzania (the United Republic of)"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": true })}
      {...rest}
    >
      <mask
        id={`${uid}-TZ-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-TZ-a)`}>
        <path fill="#009B77" d="M72-11H0v72l72-72Z" />
        <path fill="#0091DA" d="M72 61v-72L0 61h72Z" />
        <path
          fill="#FBD381"
          d="M57.803-18.016 79.016 3.197 15.479 66.734-5.734 45.521z"
        />
        <path
          fill="#31373D"
          d="M73.436.292 60.708-12.436-1.938 50.21 10.79 62.937z"
        />
      </g>
    </CountrySymbol>
  );
});

export default TZ_Sharp;
