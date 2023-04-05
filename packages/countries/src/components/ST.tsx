// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef, useState } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type STProps = CountrySymbolProps;

const ST = forwardRef<SVGSVGElement, STProps>(function ST(props: STProps, ref) {
  const [uid] = useState(() => props.id || Math.random().toString());

  return (
    <CountrySymbol
      data-testid="ST"
      aria-label="Sao Tome and Principe"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-ST-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-ST-a)`}>
        <path fill="#009B77" d="M0 0h72v72H0z" />
        <path fill="#FBD381" d="M0 48V24h72v24z" />
        <path
          fill="#31373D"
          d="M42.611 34.045 44.4 30l1.788 4.045 4.212.539-3.106 3.038.814 4.378-3.708-2.5-3.708 2.5.814-4.378-3.106-3.038 4.212-.539Zm15.601 0L60 30l1.788 4.045 4.212.539-3.106 3.038.814 4.378L60 39.5 56.292 42l.814-4.378L54 34.584l4.212-.539Z"
        />
        <path fill="#DD2033" d="M36 36 0 0v72l36-36Z" />
      </g>
    </CountrySymbol>
  );
});

export default ST;
