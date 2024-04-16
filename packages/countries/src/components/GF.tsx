// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GFProps = CountrySymbolProps;

const GF = forwardRef<SVGSVGElement, GFProps>(function GF(props: GFProps, ref) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="GF"
      aria-label="French Guiana"
      viewBox="0 0 72 72"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": false })}
      {...rest}
    >
      <mask
        id={`${uid}-GF-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-GF-a)`}>
        <path fill="#FBD381" d="M0 72h72V0H0z" />
        <path fill="#009B77" d="M72 0v72L0 0h72Z" />
        <path
          fill="#DD2033"
          d="m36 24-3.577 8.09L24 33.168l6.213 6.077L28.583 48 36 43l7.416 5-1.629-8.756L48 33.167l-8.423-1.076L36 24Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default GF;
