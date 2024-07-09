import { useId } from "@salt-ds/core";
import { clsx } from "clsx";
// WARNING: This file was generated by a script. Do not modify it manually
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
      viewBox="0 0 72 50"
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
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-CD-a)`}>
        <path fill="#0091DA" d="M0 0h72v50H0z" />
        <path
          fill="#FBD381"
          d="m-.1 51.627 17.677 17.677L79.62 7.263 61.94-10.415z"
        />
        <path
          fill="#DD2033"
          d="M15.975 64.062 5.368 53.456 66.682-7.858 77.288 2.748z"
        />
        <path
          fill="#FBD381"
          d="m15 5-2.98 6.742L5 12.64l5.177 5.064L8.82 25 15 20.833 21.18 25l-1.357-7.297L25 12.64l-7.02-.897L15 5Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default CD_Sharp;
