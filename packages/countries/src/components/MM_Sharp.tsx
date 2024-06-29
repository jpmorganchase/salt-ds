import { useId } from "@salt-ds/core";
import { clsx } from "clsx";
// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type MM_SharpProps = CountrySymbolProps;

const MM_Sharp = forwardRef<SVGSVGElement, MM_SharpProps>(function MM_Sharp(
  props: MM_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="MM_Sharp"
      aria-label="Myanmar"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-MM-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-MM-a)`}>
        <path fill="#DD2033" d="M0 50V34h72v16z" />
        <path fill="#009B77" d="M0 34V16h72v18z" />
        <path fill="#FBD381" d="M0 16V0h72v16z" />
        <path
          fill="#F5F7F8"
          d="m36 7-5.365 12.136L18 20.75l9.32 9.115L24.874 43 36 35.5 47.125 43 44.68 29.866 54 20.751l-12.635-1.615L36 7Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default MM_Sharp;
