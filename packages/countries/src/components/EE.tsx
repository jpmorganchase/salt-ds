// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type EEProps = CountrySymbolProps;

const EE = forwardRef<SVGSVGElement, EEProps>(function EE(props: EEProps, ref) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "50%",
    "--saltCountrySymbol-aspect-ratio-multiplier": "1",
  };

  return (
    <CountrySymbol
      data-testid="EE"
      style={style}
      aria-label="Estonia"
      viewBox="0 0 72 72"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-EE-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-EE-a)`}>
        <path fill="#F5F7F8" d="M0 72V48h72v24z" />
        <path fill="#31373D" d="M0 48V24h72v24z" />
        <path fill="#0091DA" d="M0 24V0h72v24z" />
      </g>
    </CountrySymbol>
  );
});

export default EE;
