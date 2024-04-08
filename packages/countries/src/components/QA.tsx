// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type QAProps = CountrySymbolProps;

const QA = forwardRef<SVGSVGElement, QAProps>(function QA(props: QAProps, ref) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "50%",
  };

  return (
    <CountrySymbol
      data-testid="QA"
      style={style}
      aria-label="Qatar"
      viewBox="0 0 72 72"
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
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-QA-a)`}>
        <path fill="#F5F7F8" d="M0 0h72v72H0z" />
        <path
          fill="#85001F"
          d="M20 0h52v72H20l10-9-10-9 10-9-10-9 10-9-10-9 10-9-10-9Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default QA;
