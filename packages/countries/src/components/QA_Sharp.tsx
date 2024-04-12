// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type QA_SharpProps = CountrySymbolProps;

const QA_Sharp = forwardRef<SVGSVGElement, QA_SharpProps>(function QA_Sharp(
  props: QA_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "0",
    "--saltCountrySymbol-aspect-ratio-multiplier": "1.44",
  };

  return (
    <CountrySymbol
      data-testid="QA_Sharp"
      style={style}
      aria-label="Qatar"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-QA-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-QA-a)`}>
        <path fill="#F5F7F8" d="M0-11h72v72H0z" />
        <path
          fill="#85001F"
          d="M20-11h52v72H20l10-9-10-9 10-9-10-9 10-9-10-9 10-9-10-9Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default QA_Sharp;