// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GB_SCT_SharpProps = CountrySymbolProps;

const GB_SCT_Sharp = forwardRef<SVGSVGElement, GB_SCT_SharpProps>(
  function GB_SCT_Sharp(props: GB_SCT_SharpProps, ref) {
    const uid = useId(props.id);

    const { style: styleProp, ...rest } = props;

    const style = {
      ...styleProp,
      borderRadius: "0",
      "--saltCountrySymbol-aspect-ratio-multiplier": "1.44",
    };

    return (
      <CountrySymbol
        data-testid="GB_SCT_Sharp"
        style={style}
        aria-label="Scotland"
        viewBox="0 0 72 50"
        ref={ref}
        {...rest}
      >
        <mask
          id={`${uid}-GB-SCT-a`}
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#D9D9D9" d="M0 0h72v50H0z" />
        </mask>
        <g mask={`url(#${uid}-GB-SCT-a)`}>
          <path fill="#005EB8" d="M0 0h72v50H0z" />
          <path
            fill="#F5F7F8"
            d="M67.028-.636 60.664-7 36.3 17.364 11.936-7 5.572-.636l24.364 24.364L3.164 50.5l6.364 6.364L36.3 30.092l26.772 26.772 6.364-6.364-26.772-26.772L67.028-.636Z"
          />
        </g>
      </CountrySymbol>
    );
  }
);

export default GB_SCT_Sharp;
