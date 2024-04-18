// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SO_SharpProps = CountrySymbolProps;

const SO_Sharp = forwardRef<SVGSVGElement, SO_SharpProps>(function SO_Sharp(
  props: SO_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="SO_Sharp"
      aria-label="Somalia"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": true })}
      {...rest}
    >
      <mask
        id={`${uid}-SO-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-SO-a)`}>
        <path fill="#0091DA" d="M0 50V0h72v50z" />
        <path
          fill="#F5F7F8"
          d="m36 7-5.365 12.136L18 20.75l9.32 9.115L24.874 43 36 35.5 47.125 43 44.68 29.866 54 20.751l-12.635-1.615L36 7Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default SO_Sharp;
