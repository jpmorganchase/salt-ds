// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type JEProps = CountrySymbolProps;

const JE = forwardRef<SVGSVGElement, JEProps>(function JE(props: JEProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="JE"
      aria-label="Jersey"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-JE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-JE-a)`}>
        <path fill="#f5f7f8" d="M0 0h20v20H0z" />
        <path
          fill="#dd2033"
          d="m15.971 18.171 2.357-2.357-5.892-5.893 5.814-5.814-2.357-2.357-5.814 5.814-5.893-5.892-2.357 2.357L7.722 9.92 1.75 15.893l2.357 2.357 5.972-5.972z"
        />
        <path
          fill="#f1b434"
          d="M7.222 3.056h5.556v2.008c0 1.807-1.1 3.432-2.778 4.103a4.42 4.42 0 0 1-2.778-4.103z"
        />
      </g>
    </CountrySymbol>
  );
});

export default JE;
