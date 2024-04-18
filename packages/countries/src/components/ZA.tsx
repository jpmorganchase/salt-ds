// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type ZAProps = CountrySymbolProps;

const ZA = forwardRef<SVGSVGElement, ZAProps>(function ZA(props: ZAProps, ref) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="ZA"
      aria-label="South Africa"
      viewBox="0 0 72 72"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": false })}
      {...rest}
    >
      <mask
        id={`${uid}-ZA-a`}
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
          transform="matrix(1 0 0 -1 0 72)"
        />
      </mask>
      <g mask={`url(#${uid}-ZA-a)`}>
        <path fill="#DD2033" d="M0 0v24h72V0z" />
        <path fill="#005EB8" d="M0 48v24h72V48z" />
        <path fill="#F5F7F8" d="M72.4 24H44.8l-32-24v72l32-24h27.6V24Z" />
        <path fill="#008259" d="M72 44H42.133L4.8 72V0l37.333 28H72v16Z" />
        <path fill="#F1B434" d="M-3.6 9v54l36-27-36-27Z" />
        <path fill="#31373D" d="m24.4 36-48-36v72l48-36Z" />
      </g>
    </CountrySymbol>
  );
});

export default ZA;
