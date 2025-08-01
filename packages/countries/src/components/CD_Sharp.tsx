// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type CD_SharpProps = CountrySymbolProps;

const CD_Sharp = forwardRef<SVGSVGElement, CD_SharpProps>(function CD_Sharp(
  props: CD_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="CD_Sharp"
      aria-label="Congo (the Democratic Republic of the)"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-CD-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-CD-a)`}>
        <path fill="#0091da" d="M0 0h29v20H0z" />
        <path
          fill="#fbd381"
          d="m-.04 20.65 7.12 7.072L32.069 2.905l-7.12-7.07z"
        />
        <path
          fill="#dd2033"
          d="m6.434 25.625-4.272-4.243L26.858-3.143l4.272 4.242z"
        />
        <path
          fill="#fbd381"
          d="m6.042 2-1.2 2.697-2.828.359L4.099 7.08 3.552 10l2.49-1.667L8.53 10l-.547-2.919 2.085-2.025-2.827-.36z"
        />
      </g>
    </CountrySymbol>
  );
});

export default CD_Sharp;
