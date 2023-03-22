// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef, useState } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type HondurasProps = CountrySymbolProps;

const Honduras = forwardRef<SVGSVGElement, HondurasProps>(function Honduras(
  props: HondurasProps,
  ref
) {
  const [uid] = useState(() => props.id || Math.random().toString());

  return (
    <CountrySymbol
      data-testid="Honduras"
      aria-label="Honduras"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-HN-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-HN-a)`}>
        <path fill="#0091DA" d="M0 0h72v72H0z" />
        <path fill="#F5F7F8" d="M0 54V18h72v36z" />
        <path
          fill="#0091DA"
          d="m18.8 23-1.788 4.045-4.212.539 3.106 3.038L15.092 35l3.708-2.5 3.708 2.5-.814-4.378 3.106-3.038-4.212-.539L18.8 23Zm17 14-1.788 4.045-4.212.539 3.106 3.038L32.092 49l3.708-2.5 3.708 2.5-.814-4.378 3.106-3.038-4.211-.539L35.8 37Zm15.212-9.955L52.8 23l1.789 4.045 4.211.539-3.106 3.038.814 4.378-3.708-2.5-3.708 2.5.814-4.378-3.106-3.038 4.212-.539Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default Honduras;
