// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef, useState } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type CIProps = CountrySymbolProps;

const CI = forwardRef<SVGSVGElement, CIProps>(function CI(props: CIProps, ref) {
  const [uid] = useState(() => props.id || Math.random().toString());

  return (
    <CountrySymbol
      data-testid="CI"
      aria-label="Côte d&#39;Ivoire"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-CI-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle
          cx="36"
          cy="36"
          r="36"
          fill="#D9D9D9"
          transform="rotate(90 36 36)"
        />
      </mask>
      <g mask={`url(#${uid}-CI-a)`}>
        <path fill="#009B77" d="M48 0h24v72H48z" />
        <path fill="#F5F7F8" d="M24 0h24v72H24z" />
        <path fill="#FF9E42" d="M0 0h24v72H0z" />
      </g>
    </CountrySymbol>
  );
});

export default CI;
