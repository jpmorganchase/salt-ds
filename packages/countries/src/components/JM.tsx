// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type JMProps = CountrySymbolProps;

const JM = forwardRef<SVGSVGElement, JMProps>(function JM(props: JMProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="JM"
      aria-label="Jamaica"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-JM-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-JM-a)`}>
        <path fill="#31373D" d="M0 0h72v72H0z" />
        <path fill="#009B77" d="m0 72 35-36L0 0h72L35 36l37 36H0Z" />
        <path
          fill="#F1B434"
          d="m57.92 64.991 7.071-7.07L43.071 36l21.92-21.92-7.07-7.071L36 28.929 14.08 7.009l-7.071 7.07L28.929 36 7.009 57.92l7.07 7.071L36 43.071l21.92 21.92Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default JM;
