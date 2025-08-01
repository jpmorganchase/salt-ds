// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type ARProps = CountrySymbolProps;

const AR = forwardRef<SVGSVGElement, ARProps>(function AR(props: ARProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="AR"
      aria-label="Argentina"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-AR-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-AR-a)`}>
        <path fill="#86c5fa" d="M0 0h20v20H0z" />
        <path fill="#f5f7f8" d="M0 14V6h20v8z" />
        <path
          fill="#f1b434"
          d="m13 10-1.226.606.653 1.248-1.331-.268L10.927 13 10 11.96 9.073 13l-.169-1.414-1.33.268.652-1.248L7 10l1.226-.606-.653-1.248 1.331.268L9.073 7 10 8.04 10.927 7l.169 1.414 1.331-.268-.653 1.248z"
        />
      </g>
    </CountrySymbol>
  );
});

export default AR;
