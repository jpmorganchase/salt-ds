// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type ER_SharpProps = CountrySymbolProps;

const ER_Sharp = forwardRef<SVGSVGElement, ER_SharpProps>(function ER_Sharp(
  props: ER_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "0",
  };

  return (
    <CountrySymbol
      data-testid="ER_Sharp"
      style={style}
      aria-label="Eritrea"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-ER-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-ER-a)`}>
        <path fill="#009B77" d="M0 0h72v25H0z" />
        <path fill="#0091DA" d="M0 50V25h72v25z" />
        <path fill="#DD2033" d="M72 25 0 0v50l72-25Z" />
        <path
          fill="#FBD381"
          d="M20 36c6.627 0 12-5.373 12-12 0-3.314-1.343-6.314-3.515-8.485l-2.424 2.424a8.574 8.574 0 0 1-4.347 14.46V18.858h-3.428V32.4a8.574 8.574 0 0 1-4.347-14.46l-2.424-2.425A11.962 11.962 0 0 0 8 24c0 6.627 5.373 12 12 12Zm0-24h.025-.05H20Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default ER_Sharp;
